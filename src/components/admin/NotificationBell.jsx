import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useData } from '../../contexts/DataContext';
import { useDemoMode } from '../../contexts/DemoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import './NotificationBell.scss';

const STORAGE_KEY = 'jm_admin_notifications';
const PENDING_TIMEOUT = 60000; // 60s
const CLEANUP_DAYS = 7;
const MAX_NOTIFICATIONS = 100;

// ── localStorage helpers ──────────────────────────────────────────────────────
const loadStored = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { items: [], lastSeen: null };
        const data = JSON.parse(raw);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - CLEANUP_DAYS);
        const items = (data.items || []).filter(n =>
            !n.read || new Date(n.createdAt) > cutoff
        );
        return { items, lastSeen: data.lastSeen || null };
    } catch {
        return { items: [], lastSeen: null };
    }
};

const saveStored = (items, lastSeen) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, lastSeen }));
};

// ── Time formatting ───────────────────────────────────────────────────────────
const formatTime = (ts) => new Date(ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

const formatDateLabel = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'dziś';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'wczoraj';
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
};

// ── Component ─────────────────────────────────────────────────────────────────
const NotificationBell = () => {
    const { questions } = useData();
    const isDemoMode = useDemoMode();
    const [notifications, setNotifications] = useState(() => loadStored().items);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);
    const pendingScans = useRef(new Map());
    const questionsRef = useRef(questions);
    const storedLastSeen = useRef(loadStored().lastSeen);
    const listenersReady = useRef(false);

    useEffect(() => { questionsRef.current = questions; }, [questions]);

    // Persist to localStorage
    useEffect(() => {
        if (listenersReady.current) {
            saveStored(notifications, storedLastSeen.current);
        }
    }, [notifications]);

    const getQuestionText = useCallback((qid) =>
        questionsRef.current?.[qid]?.questionText || qid
    , []);

    const getOptionLabel = useCallback((qid, answerId) => {
        const opts = questionsRef.current?.[qid]?.options;
        return opts?.find(o => o.id === answerId)?.label || answerId;
    }, []);

    const addNotification = useCallback((notif) => {
        setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev;
            return [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
        });
    }, []);

    // ── Smart pairing: try to match answer with pending scan ──────────────
    const tryPairWithPending = useCallback((answerData, answerId) => {
        const answerTime = new Date(answerData.timestamp).getTime();

        for (const [scanId, pending] of pendingScans.current.entries()) {
            const scanTime = new Date(pending.data.timestamp).getTime();
            if (
                pending.data.questionId === answerData.questionId &&
                Math.abs(answerTime - scanTime) < PENDING_TIMEOUT
            ) {
                clearTimeout(pending.timeout);
                pendingScans.current.delete(scanId);

                addNotification({
                    id: `paired_${scanId}`,
                    type: 'scan_answered',
                    questionId: answerData.questionId,
                    questionText: getQuestionText(answerData.questionId),
                    answer: getOptionLabel(answerData.questionId, answerData.answer),
                    location: pending.data.location || answerData.location || null,
                    timestamp: answerData.timestamp,
                    read: false,
                    createdAt: new Date().toISOString(),
                });
                return true;
            }
        }
        return false;
    }, [addNotification, getQuestionText, getOptionLabel]);

    // ── Historical batch pairing ──────────────────────────────────────────
    const processHistorical = useCallback((scans, answers) => {
        const usedScanIds = new Set();

        scans.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        answers.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        // Pair answers with closest scan
        for (const answer of answers) {
            const aTime = new Date(answer.timestamp).getTime();
            const match = scans.find(s =>
                !usedScanIds.has(s.id) &&
                s.questionId === answer.questionId &&
                Math.abs(new Date(s.timestamp).getTime() - aTime) < PENDING_TIMEOUT
            );

            if (match) {
                usedScanIds.add(match.id);
                addNotification({
                    id: `paired_${match.id}`,
                    type: 'scan_answered',
                    questionId: answer.questionId,
                    questionText: getQuestionText(answer.questionId),
                    answer: getOptionLabel(answer.questionId, answer.answer),
                    location: match.location || answer.location || null,
                    timestamp: answer.timestamp,
                    read: false,
                    createdAt: new Date().toISOString(),
                });
            } else {
                addNotification({
                    id: `answer_${answer.id}`,
                    type: 'answer_only',
                    questionId: answer.questionId,
                    questionText: getQuestionText(answer.questionId),
                    answer: getOptionLabel(answer.questionId, answer.answer),
                    location: answer.location || null,
                    timestamp: answer.timestamp,
                    read: false,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        // Unpaired scans = no answer
        for (const scan of scans) {
            if (usedScanIds.has(scan.id)) continue;
            addNotification({
                id: `scan_${scan.id}`,
                type: 'scan_no_answer',
                questionId: scan.questionId,
                questionText: getQuestionText(scan.questionId),
                location: scan.location || null,
                timestamp: scan.timestamp,
                read: false,
                createdAt: new Date().toISOString(),
            });
        }
    }, [addNotification, getQuestionText, getOptionLabel]);

    // ── onSnapshot listeners ──────────────────────────────────────────────
    useEffect(() => {
        if (!questions || isDemoMode) return;

        const defaultStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const effectiveStart = storedLastSeen.current || defaultStart;
        let isFirstScans = true;
        let isFirstAnswers = true;
        let historicalScans = [];
        let historicalAnswers = [];

        const tryProcessHistorical = () => {
            if (!isFirstScans && !isFirstAnswers && historicalScans && historicalAnswers) {
                processHistorical(historicalScans, historicalAnswers);
                historicalScans = null;
                historicalAnswers = null;
                listenersReady.current = true;
            }
        };

        const unsubScans = onSnapshot(collection(db, 'scans'), (snapshot) => {
            if (isFirstScans) {
                isFirstScans = false;
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.timestamp && data.timestamp > effectiveStart) {
                        historicalScans.push({ id: doc.id, ...data });
                    }
                });
                tryProcessHistorical();
                return;
            }

            // Real-time
            snapshot.docChanges().forEach(change => {
                if (change.type !== 'added') return;
                const data = change.doc.data();
                if (!data.timestamp) return;
                const scanId = change.doc.id;

                const timeout = setTimeout(() => {
                    pendingScans.current.delete(scanId);
                    addNotification({
                        id: `scan_${scanId}`,
                        type: 'scan_no_answer',
                        questionId: data.questionId,
                        questionText: getQuestionText(data.questionId),
                        location: data.location || null,
                        timestamp: data.timestamp,
                        read: false,
                        createdAt: new Date().toISOString(),
                    });
                }, PENDING_TIMEOUT);

                pendingScans.current.set(scanId, { timeout, data });
            });
        });

        const unsubSocial = onSnapshot(collection(db, 'socialClicks'), (snapshot) => {
            if (!listenersReady.current) {
                // Skip initial load — social clicks are informational, no historical pairing needed
                return;
            }

            snapshot.docChanges().forEach(change => {
                if (change.type !== 'added') return;
                const data = change.doc.data();
                if (!data.timestamp) return;

                addNotification({
                    id: `social_${change.doc.id}`,
                    type: 'social_click',
                    socialType: data.type,
                    questionId: data.questionId,
                    questionText: getQuestionText(data.questionId),
                    location: data.location || null,
                    timestamp: data.timestamp,
                    read: false,
                    createdAt: new Date().toISOString(),
                });
            });
        });

        const unsubAnswers = onSnapshot(collection(db, 'answers'), (snapshot) => {
            if (isFirstAnswers) {
                isFirstAnswers = false;
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.timestamp && data.timestamp > effectiveStart) {
                        historicalAnswers.push({ id: doc.id, ...data });
                    }
                });
                tryProcessHistorical();
                return;
            }

            // Real-time
            snapshot.docChanges().forEach(change => {
                if (change.type !== 'added') return;
                const data = change.doc.data();
                if (!data.timestamp) return;

                const paired = tryPairWithPending(data, change.doc.id);
                if (!paired) {
                    addNotification({
                        id: `answer_${change.doc.id}`,
                        type: 'answer_only',
                        questionId: data.questionId,
                        questionText: getQuestionText(data.questionId),
                        answer: getOptionLabel(data.questionId, data.answer),
                        location: data.location || null,
                        timestamp: data.timestamp,
                        read: false,
                        createdAt: new Date().toISOString(),
                    });
                }
            });
        });

        return () => {
            unsubScans();
            unsubSocial();
            unsubAnswers();
            for (const p of pendingScans.current.values()) clearTimeout(p.timeout);
            pendingScans.current.clear();
        };
    }, [questions, isDemoMode]);

    // ── Close on outside click ────────────────────────────────────────────
    useEffect(() => {
        const handleClick = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        const now = new Date().toISOString();
        storedLastSeen.current = now;
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            saveStored(updated, now);
            return updated;
        });
    };

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    // ── Notification icon by type ─────────────────────────────────────────
    const typeIcon = (type) => {
        switch (type) {
            case 'scan_answered': return '✅';
            case 'scan_no_answer': return '👀';
            case 'answer_only': return '✅';
            case 'social_click': return '📱';
            default: return '•';
        }
    };

    const typeText = (n) => {
        switch (n.type) {
            case 'scan_answered':
                return <>skan + odpowiedź → <strong>{n.answer}</strong></>;
            case 'scan_no_answer':
                return <>skan bez odpowiedzi</>;
            case 'answer_only':
                return <>odpowiedź → <strong>{n.answer}</strong></>;
            case 'social_click':
                return <>klik <strong>{n.socialType === 'instagram' ? 'Instagram' : 'Facebook'}</strong></>;
            default:
                return <>zdarzenie</>;
        }
    };

    // ── Group by date (newest first) ───────────────────────────────────────
    const sorted = [...notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const grouped = {};
    sorted.forEach(n => {
        const label = formatDateLabel(n.timestamp);
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(n);
    });

    return (
        <div className='notif-bell' ref={bellRef}>
            <button type='button' className='notif-bell-btn' onClick={toggleOpen}>
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && (
                    <span className='notif-badge'>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className='notif-dropdown'>
                    <div className='notif-header'>
                        <span className='notif-header-title'>Powiadomienia</span>
                        {unreadCount > 0 && (
                            <button type='button' className='notif-mark-read' onClick={markAllRead}>
                                przeczytane
                            </button>
                        )}
                    </div>

                    <div className='notif-list'>
                        {notifications.length === 0 ? (
                            <div className='notif-empty'>Brak nowych powiadomień</div>
                        ) : (
                            Object.entries(grouped).map(([dateLabel, items]) => (
                                <div key={dateLabel} className='notif-group'>
                                    <div className='notif-date-label'>{dateLabel}</div>
                                    {items.map(n => (
                                        <div key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
                                            <span className='notif-icon'>{typeIcon(n.type)}</span>
                                            <div className='notif-body'>
                                                <div className='notif-question'>{n.questionText}</div>
                                                <div className='notif-detail'>{typeText(n)}</div>
                                                {n.location && (
                                                    <div className='notif-location'>📍 {n.location}</div>
                                                )}
                                            </div>
                                            <span className='notif-time'>{formatTime(n.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
