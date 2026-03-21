import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    doc, setDoc, deleteDoc, updateDoc,
    collection, query, where, getDocs, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useData } from '../../contexts/DataContext';
import { useDemoMode } from '../../contexts/DemoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPrint, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import QRStickerModal from './QRStickerModal';
import './ContentTab.scss';


// Generuje slug z tekstu pytania: "Lepszy kompan?" → "lepszy_kompan"
const slugify = (text) =>
    text.toLowerCase()
        .replace(/[ąćęłńóśźż]/g, c => ({ ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z' })[c] || c)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 40);

const optionSlug = (label) =>
    label.toLowerCase()
        .replace(/[ąćęłńóśźż]/g, c => ({ ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z' })[c] || c)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 40);

// ── Formularz pytania ─────────────────────────────────────────────────────────
const QuestionForm = ({ initial, isNew, onSave, onCancel, maxNumber }) => {
    const [text,          setText]          = useState(initial?.questionText ?? '');
    const [qId,           setQId]           = useState(initial?.id ?? '');
    const [allowText,     setAllowText]     = useState(initial?.allowText ?? false);
    const [suggestions,   setSuggestions]   = useState([]);
    const [suggestionsFor,setSuggestionsFor]= useState(null);
    const [userAnswers,   setUserAnswers]   = useState([]); // odpowiedzi dodane przez users
    const placesDebounce = useRef(null);
    // Edytujemy tylko stałe opcje — opcja type:text jest auto-dodawana
    const [options, setOptions] = useState(
        initial?.options
            ? initial.options.filter(o => o.type !== 'text').map(o => ({ ...o }))
            : [{ id: '', label: '' }, { id: '', label: '' }]
    );
    const [saving, setSaving] = useState(false);
    const [err,    setErr]    = useState('');

    // Pobierz odpowiedzi użytkowników dla allowText pytań
    useEffect(() => {
        if (!initial?.id || !initial?.allowText || isNew) return;
        const fetchUserAnswers = async () => {
            try {
                const q = query(collection(db, 'answers'), where('questionId', '==', initial.id));
                const snap = await getDocs(q);
                const counts = {};
                snap.forEach(d => {
                    const ans = d.data().answer;
                    if (ans && ans !== 'inne') counts[ans] = (counts[ans] || 0) + 1;
                });
                const knownIds = new Set(initial.options.map(o => o.id));
                const extras = Object.entries(counts)
                    .filter(([key]) => !knownIds.has(key))
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, count]) => ({ id: key, label: key, count }));
                setUserAnswers(extras);
            } catch (e) {
                console.error('Błąd pobierania odpowiedzi users:', e);
            }
        };
        fetchUserAnswers();
    }, [initial, isNew]);

    const handleTextChange = (val) => {
        setText(val);
        if (isNew) setQId(slugify(val));
    };

    const fetchPlacesSuggestions = (idx, val) => {
        if (placesDebounce.current) clearTimeout(placesDebounce.current);
        if (!val || val.trim().length < 2) { setSuggestions([]); setSuggestionsFor(null); return; }
        placesDebounce.current = setTimeout(async () => {
            try {
                const res = await fetch('/.netlify/functions/placesAutocomplete', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ input: val }),
                });
                const data = await res.json();
                setSuggestions(data.suggestions || []);
                setSuggestionsFor(idx);
            } catch {
                setSuggestions([]);
            }
        }, 300);
    };

    const handleOptLabel = (idx, val) => {
        setOptions(prev => prev.map((o, i) => i === idx
            ? { ...o, label: val, id: isNew ? optionSlug(val) : o.id, placeId: null, address: null }
            : o
        ));
        if (allowText) fetchPlacesSuggestions(idx, val);
    };

    const handleOptSuggestionSelect = (idx, suggestion) => {
        setOptions(prev => prev.map((o, i) => i === idx
            ? { ...o, label: suggestion.name, id: isNew ? optionSlug(suggestion.name) : o.id, placeId: suggestion.placeId || null, address: suggestion.address || null }
            : o
        ));
        setSuggestions([]);
        setSuggestionsFor(null);
    };

    const addOption = () => setOptions(prev => [...prev, { id: '', label: '' }]);
    const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx));

    // Adoptuj odpowiedź użytkownika jako oficjalną opcję
    const adoptUserAnswer = (ua) => {
        setOptions(prev => [...prev, { id: ua.id, label: ua.label }]);
        setUserAnswers(prev => prev.filter(a => a.id !== ua.id));
    };

    const handleSave = async () => {
        if (!text.trim()) { setErr('Wpisz treść pytania.'); return; }
        if (!qId.trim())  { setErr('ID pytania nie może być puste.'); return; }
        if (options.some(o => !o.label.trim())) { setErr('Każda odpowiedź musi mieć treść.'); return; }
        setSaving(true);
        setErr('');
        try {
            const fixedOptions = options.map(o => ({
                // allowText: nowe opcje używają labela jako ID (bo tak są zapisane odpowiedzi users)
                id: o.id || (allowText ? o.label.trim() : optionSlug(o.label)),
                label: o.label.trim(),
                ...(o.placeId  && { placeId:  o.placeId }),
                ...(o.address  && { address:  o.address }),
            }));
            const allOptions = allowText
                ? [...fixedOptions, { id: 'inne', label: '+ dodaj', type: 'text' }]
                : fixedOptions;
            await onSave({
                id: qId.trim(),
                questionText: text.trim(),
                options: allOptions,
                allowText: allowText || false,
                number: initial?.number ?? maxNumber + 1,
            });
        } catch (e) {
            setErr('Błąd zapisu: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='ct-form'>
            <div className='ct-form-field'>
                <label className='ct-label'>Treść pytania</label>
                <input
                    className='ct-input'
                    value={text}
                    onChange={e => handleTextChange(e.target.value)}
                    placeholder='Lepszy kompan?'
                />
            </div>
            {isNew && (
                <div className='ct-form-field'>
                    <label className='ct-label'>ID (URL slug)</label>
                    <input
                        className='ct-input ct-input--id'
                        value={qId}
                        onChange={e => setQId(e.target.value.replace(/[^a-z0-9_]/g, ''))}
                        placeholder='lepszy_kompan'
                    />
                </div>
            )}
            <div className='ct-form-field'>
                <label className='ct-label'>
                    Odpowiedzi
                    {allowText && <span className='ct-label-hint'> — wpisz nazwę, wybierz z podpowiedzi żeby przypiąć do Map</span>}
                </label>
                <div className='ct-options'>
                    {options.map((opt, idx) => (
                        <div key={idx} className='ct-option-row'>
                            <div className='ct-option-input-wrap'>
                                <input
                                    className={`ct-input${opt.placeId ? ' ct-input--linked' : ''}`}
                                    value={opt.label}
                                    onChange={e => handleOptLabel(idx, e.target.value)}
                                    onBlur={() => setTimeout(() => { setSuggestions([]); setSuggestionsFor(null); }, 200)}
                                    placeholder={`opcja ${idx + 1}`}
                                />
                                {opt.placeId && (
                                    <span className='ct-option-pin' title={opt.address || 'Przypięte do Map'}>📍</span>
                                )}
                                {suggestionsFor === idx && suggestions.length > 0 && (
                                    <ul className='ct-places-dropdown'>
                                        {suggestions.map((s, i) => (
                                            <li key={i} className='ct-places-item' onMouseDown={() => handleOptSuggestionSelect(idx, s)}>
                                                <span className='ct-places-name'>{s.name}</span>
                                                {s.address && <span className='ct-places-addr'>{s.address}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {options.length > 2 && (
                                <button type='button' className='ct-remove-btn' onClick={() => removeOption(idx)}>✕</button>
                            )}
                        </div>
                    ))}
                    <button type='button' className='ct-add-btn' onClick={addOption}>+ dodaj odpowiedź</button>
                </div>
            </div>
            {/* Odpowiedzi dodane przez użytkowników */}
            {allowText && userAnswers.length > 0 && (
                <div className='ct-form-field'>
                    <label className='ct-label ct-label--user'>Dodane przez użytkowników</label>
                    <div className='ct-user-answers'>
                        {userAnswers.map(ua => (
                            <button
                                key={ua.id}
                                type='button'
                                className='ct-user-answer'
                                onClick={() => adoptUserAnswer(ua)}
                                title='Kliknij żeby dodać jako oficjalną opcję'
                            >
                                <span className='ct-ua-label'>{ua.label}</span>
                                <span className='ct-ua-count'>{ua.count}×</span>
                                <span className='ct-ua-add'>+</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <label className='ct-allowtext-row'>
                <input
                    type='checkbox'
                    checked={allowText}
                    onChange={e => setAllowText(e.target.checked)}
                />
                <span>Pytanie otwarte — dodaj opcję <em>"+ dodaj"</em> (użytkownicy mogą wpisać własną odpowiedź)</span>
            </label>
            {err && <p className='ct-error'>{err}</p>}
            <div className='ct-form-actions'>
                <button type='button' className='ct-save-btn' onClick={handleSave} disabled={saving}>
                    {saving ? 'Zapisuję...' : 'Zapisz'}
                </button>
                <button type='button' className='ct-cancel-btn' onClick={onCancel}>Anuluj</button>
            </div>
        </div>
    );
};

// ── Formularz ciekawostki ─────────────────────────────────────────────────────
const FactForm = ({ initial, onSave, onCancel }) => {
    const [text,   setText]   = useState(initial?.text ?? '');
    const [saving, setSaving] = useState(false);
    const [err,    setErr]    = useState('');

    const handleSave = async () => {
        if (!text.trim()) { setErr('Wpisz treść ciekawostki.'); return; }
        setSaving(true);
        setErr('');
        try {
            await onSave({ text: text.trim() });
        } catch (e) {
            setErr('Błąd zapisu: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='ct-form'>
            <textarea
                className='ct-textarea'
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                placeholder='Wpisz ciekawostkę...'
            />
            {err && <p className='ct-error'>{err}</p>}
            <div className='ct-form-actions'>
                <button type='button' className='ct-save-btn' onClick={handleSave} disabled={saving}>
                    {saving ? 'Zapisuję...' : 'Zapisz'}
                </button>
                <button type='button' className='ct-cancel-btn' onClick={onCancel}>Anuluj</button>
            </div>
        </div>
    );
};

// ── Główny komponent ──────────────────────────────────────────────────────────
const ContentTab = ({ filterPrinted = false, onClearFilter }) => {
    const { questions, facts, refresh } = useData();
    const isDemoMode = useDemoMode();
    const [section,          setSection]          = useState('pytania'); // 'pytania' | 'ciekawostki'
    const [editingId,        setEditingId]        = useState(null);
    const [addingNew,        setAddingNew]        = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [stickerQ,         setStickerQ]         = useState(null);
    const [showOnlyPrinted,  setShowOnlyPrinted]  = useState(filterPrinted);
    const [sectionIndicator, setSectionIndicator] = useState(null);
    const [demoToast,        setDemoToast]        = useState(false);
    const sectionNavRef = useRef(null);
    const sectionRefs = useRef({});

    useEffect(() => { setShowOnlyPrinted(filterPrinted); }, [filterPrinted]);

    useEffect(() => {
        const el = sectionRefs.current[section];
        const nav = sectionNavRef.current;
        if (!el || !nav) return;
        const navRect = nav.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setSectionIndicator({
            left: elRect.left - navRect.left,
            width: elRect.width,
        });
    }, [section]);

    const togglePrintedFilter = () => {
        const next = !showOnlyPrinted;
        setShowOnlyPrinted(next);
        if (!next && onClearFilter) onClearFilter();
    };

    const demoGuard = () => {
        if (!isDemoMode) return false;
        setDemoToast(true);
        setTimeout(() => setDemoToast(false), 2500);
        return true;
    };

    const togglePrinted = useCallback(async (id) => {
        if (demoGuard()) return;
        const q = questions[id];
        await updateDoc(doc(db, 'questions', id), { printed: !q?.printed });
        await refresh();
    }, [questions, refresh, isDemoMode]);

    const updateStickersCount = useCallback(async (id, count) => {
        if (demoGuard()) return;
        const num = Math.max(0, parseInt(count) || 0);
        await updateDoc(doc(db, 'questions', id), { stickersCount: num });
        await refresh();
    }, [refresh, isDemoMode]);

    // ── Pytania — zapis ──────────────────────────────────────────────────────
    const saveQuestion = useCallback(async (data) => {
        if (demoGuard()) return;
        const existing = questions[data.id];
        await setDoc(doc(db, 'questions', data.id), {
            questionText: data.questionText,
            options:      data.options,
            number:       data.number,
            ...(data.allowText && { allowText: true }),
            ...(existing?.printed && { printed: true }),
            ...(existing?.stickersCount && { stickersCount: existing.stickersCount }),
        });

        // Migracja odpowiedzi: scal duplikaty (case-insensitive) do canonical ID opcji
        if (data.allowText) {
            try {
                const optionIds = data.options.filter(o => o.type !== 'text').map(o => o.id);
                const optionMap = {}; // lowercase → canonical option ID
                optionIds.forEach(id => { optionMap[id.toLowerCase().trim()] = id; });

                const q = query(collection(db, 'answers'), where('questionId', '==', data.id));
                const snap = await getDocs(q);
                const batch = writeBatch(db);
                let batchCount = 0;

                snap.forEach(d => {
                    const ans = d.data().answer;
                    if (!ans) return;
                    const norm = ans.toLowerCase().trim();
                    const canonical = optionMap[norm];
                    // Jeśli odpowiedź pasuje do opcji ale ma inny zapis → zaktualizuj
                    if (canonical && ans !== canonical) {
                        batch.update(d.ref, { answer: canonical });
                        batchCount++;
                    }
                });
                if (batchCount > 0) {
                    await batch.commit();
                    console.log(`Zmigrowano ${batchCount} odpowiedzi do canonical IDs`);
                }
            } catch (err) {
                console.error('Błąd migracji odpowiedzi:', err);
            }
        }

        await refresh();
        setEditingId(null);
        setAddingNew(false);
    }, [refresh, isDemoMode]);

    // ── Ciekawostki — zapis ──────────────────────────────────────────────────
    const saveFact = useCallback(async (factId, data, number, active) => {
        if (demoGuard()) return;
        await setDoc(doc(db, 'facts', factId), {
            text:   data.text,
            number: number,
            active: active !== false,
        });
        await refresh();
        setEditingId(null);
        setAddingNew(false);
    }, [refresh, isDemoMode]);

    const addFact = useCallback(async (data) => {
        if (demoGuard()) return;
        const maxNum = facts ? Math.max(0, ...facts.map(f => f.number || 0)) : 0;
        const newId  = String(maxNum + 1).padStart(4, '0');
        await setDoc(doc(db, 'facts', newId), {
            text:   data.text,
            number: maxNum + 1,
            active: true,
        });
        await refresh();
        setAddingNew(false);
    }, [facts, refresh, isDemoMode]);

    const toggleFactActive = useCallback(async (fact) => {
        if (demoGuard()) return;
        const newActive = fact.active === false ? true : false;
        await updateDoc(doc(db, 'facts', fact.id), { active: newActive });
        await refresh();
    }, [refresh, isDemoMode]);

    // ── Usuwanie ─────────────────────────────────────────────────────────────
    const deleteQuestion = useCallback(async (id) => {
        if (demoGuard()) return;
        await deleteDoc(doc(db, 'questions', id));
        await refresh();
        setConfirmingDelete(null);
        setEditingId(null);
    }, [refresh, isDemoMode]);

    const deleteFact = useCallback(async (id) => {
        if (demoGuard()) return;
        await deleteDoc(doc(db, 'facts', id));
        await refresh();
        setConfirmingDelete(null);
        setEditingId(null);
    }, [refresh, isDemoMode]);

    if (!questions || !facts) {
        return <div className='tab-empty'><div className='tab-spinner' /></div>;
    }

    const sortedQuestions = Object.entries(questions)
        .map(([id, q]) => ({ id, ...q }))
        .sort((a, b) => (a.number || 0) - (b.number || 0));

    const maxQNumber = sortedQuestions.length > 0 ? Math.max(...sortedQuestions.map(q => q.number || 0)) : 0;
    const printedCount = sortedQuestions.filter(q => q.printed).length;
    const visibleQuestions = showOnlyPrinted ? sortedQuestions.filter(q => q.printed) : sortedQuestions;

    return (
        <div className='content-tab'>
            {demoToast && (
                <div className='ct-demo-toast'>tryb demo — zmiany nie są zapisywane</div>
            )}
            {/* Przełącznik sekcji */}
            <div className='ct-section-toggle' ref={sectionNavRef}>
                <button
                    type='button'
                    ref={el => { sectionRefs.current['pytania'] = el; }}
                    className={`ct-section-btn${section === 'pytania' ? ' active' : ''}`}
                    onClick={() => { setSection('pytania'); setEditingId(null); setAddingNew(false); setConfirmingDelete(null); }}
                >
                    Pytania <span className='ct-count'>{sortedQuestions.length}</span>
                </button>
                <button
                    type='button'
                    ref={el => { sectionRefs.current['ciekawostki'] = el; }}
                    className={`ct-section-btn${section === 'ciekawostki' ? ' active' : ''}`}
                    onClick={() => { setSection('ciekawostki'); setEditingId(null); setAddingNew(false); setConfirmingDelete(null); }}
                >
                    Ciekawostki <span className='ct-count'>{facts.length}</span>
                </button>
                {sectionIndicator && (
                    <div
                        className='ct-section-indicator'
                        style={{ left: sectionIndicator.left, width: sectionIndicator.width }}
                    />
                )}
            </div>

            {/* ── PYTANIA ── */}
            {section === 'pytania' && (
                <div className='ct-list'>
                    <div className='ct-filter-bar'>
                        <button
                            type='button'
                            className={`ct-filter-btn${showOnlyPrinted ? ' active' : ''}`}
                            onClick={togglePrintedFilter}
                        >
                            <FontAwesomeIcon icon={faPrint} />
                            {showOnlyPrinted ? `wydrukowane (${printedCount})` : `tylko wydrukowane (${printedCount})`}
                        </button>
                    </div>
                    {visibleQuestions.map(q => (
                        <div key={q.id} className='ct-item'>
                            {editingId === q.id ? (
                                <QuestionForm
                                    initial={q}
                                    isNew={false}
                                    onSave={saveQuestion}
                                    onCancel={() => setEditingId(null)}
                                    maxNumber={maxQNumber}
                                />
                            ) : confirmingDelete === q.id ? (
                                <div className='ct-confirm-row'>
                                    <span className='ct-confirm-text'>Usunąć pytanie?</span>
                                    <button type='button' className='ct-confirm-yes' onClick={() => deleteQuestion(q.id)}>Usuń</button>
                                    <button type='button' className='ct-confirm-no'  onClick={() => setConfirmingDelete(null)}>Anuluj</button>
                                </div>
                            ) : (
                                <div className='ct-item-row'>
                                    <span className='ct-item-num'>#{String(q.number || 0).padStart(3, '0')}</span>
                                    <div className='ct-item-body'>
                                        <span className='ct-item-text'>{q.questionText}</span>
                                        <span className='ct-item-opts'>
                                            {q.options?.map(o => o.label).join(' / ')}
                                        </span>
                                    </div>
                                    <button
                                        type='button'
                                        className={`ct-print-btn ct-has-tooltip${q.printed ? ' active' : ''}`}
                                        onClick={() => togglePrinted(q.id)}
                                        data-tooltip={q.printed ? 'Wydrukowane' : 'Oznacz jako wydrukowane'}
                                    ><FontAwesomeIcon icon={faPrint} /></button>
                                    <input
                                        type='number'
                                        className='ct-stickers-input'
                                        value={q.stickersCount || 0}
                                        min={0}
                                        onChange={e => updateStickersCount(q.id, e.target.value)}
                                        title='Liczba rozklejonych naklejek'
                                    />
                                    <button
                                        type='button'
                                        className='ct-sticker-btn ct-has-tooltip'
                                        onClick={() => { setStickerQ(q); setEditingId(null); setAddingNew(false); setConfirmingDelete(null); }}
                                        data-tooltip='Generuj naklejki'
                                    ><FontAwesomeIcon icon={faQrcode} /></button>
                                    <button
                                        type='button'
                                        className='ct-edit-btn ct-has-tooltip'
                                        onClick={() => { setEditingId(q.id); setAddingNew(false); setConfirmingDelete(null); }}
                                        data-tooltip='Edytuj'
                                    >✎</button>
                                    <button
                                        type='button'
                                        className='ct-delete-btn ct-has-tooltip'
                                        onClick={() => { setConfirmingDelete(q.id); setEditingId(null); }}
                                        data-tooltip='Usuń'
                                    >✕</button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Dodaj nowe pytanie */}
                    {addingNew && section === 'pytania' ? (
                        <div className='ct-item ct-item--new'>
                            <QuestionForm
                                initial={null}
                                isNew={true}
                                onSave={saveQuestion}
                                onCancel={() => setAddingNew(false)}
                                maxNumber={maxQNumber}
                            />
                        </div>
                    ) : (
                        <button
                            type='button'
                            className='ct-add-new-btn'
                            onClick={() => { setAddingNew(true); setEditingId(null); setConfirmingDelete(null); }}
                        >+ Dodaj pytanie</button>
                    )}
                </div>
            )}

            {/* ── CIEKAWOSTKI ── */}
            {section === 'ciekawostki' && (
                <div className='ct-list'>
                    {facts.map((fact) => (
                        <div key={fact.id} className='ct-item'>
                            {editingId === fact.id ? (
                                <FactForm
                                    initial={fact}
                                    onSave={(data) => saveFact(fact.id, data, fact.number, fact.active)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : confirmingDelete === fact.id ? (
                                <div className='ct-confirm-row'>
                                    <span className='ct-confirm-text'>Usunąć ciekawostkę?</span>
                                    <button type='button' className='ct-confirm-yes' onClick={() => deleteFact(fact.id)}>Usuń</button>
                                    <button type='button' className='ct-confirm-no'  onClick={() => setConfirmingDelete(null)}>Anuluj</button>
                                </div>
                            ) : (
                                <div className='ct-item-row'>
                                    <span className='ct-item-num'>#{String(fact.number || 0).padStart(3, '0')}</span>
                                    <span className='ct-item-text ct-item-text--fact'>{fact.text}</span>
                                    <button
                                        type='button'
                                        className={`ct-active-btn ct-has-tooltip${fact.active === false ? '' : ' active'}`}
                                        onClick={() => toggleFactActive(fact)}
                                        data-tooltip={fact.active === false ? 'Nieaktywna — kliknij aby dodać do puli' : 'Aktywna w puli losowania'}
                                    ><FontAwesomeIcon icon={fact.active === false ? faToggleOff : faToggleOn} /></button>
                                    <button
                                        type='button'
                                        className='ct-edit-btn ct-has-tooltip'
                                        onClick={() => { setEditingId(fact.id); setAddingNew(false); setConfirmingDelete(null); }}
                                        data-tooltip='Edytuj'
                                    >✎</button>
                                    <button
                                        type='button'
                                        className='ct-delete-btn ct-has-tooltip'
                                        onClick={() => { setConfirmingDelete(fact.id); setEditingId(null); }}
                                        data-tooltip='Usuń'
                                    >✕</button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Dodaj nową ciekawostkę */}
                    {addingNew && section === 'ciekawostki' ? (
                        <div className='ct-item ct-item--new'>
                            <FactForm
                                initial={null}
                                onSave={addFact}
                                onCancel={() => setAddingNew(false)}
                            />
                        </div>
                    ) : (
                        <button
                            type='button'
                            className='ct-add-new-btn'
                            onClick={() => { setAddingNew(true); setEditingId(null); setConfirmingDelete(null); }}
                        >+ Dodaj ciekawostkę</button>
                    )}
                </div>
            )}
            {stickerQ && (
                <QRStickerModal
                    questionId={stickerQ.id}
                    questionText={stickerQ.questionText}
                    options={stickerQ.options || []}
                    questionNum={stickerQ.number || 0}
                    onClose={() => setStickerQ(null)}
                />
            )}
        </div>
    );
};

export default ContentTab;
