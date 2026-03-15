import React, { useState, useCallback } from 'react';
import {
    doc, setDoc, deleteDoc, updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useData } from '../../contexts/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPrint, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import QRStickerModal from './QRStickerModal';
import './ContentTab.scss';

const STORAGE_KEY = 'admin_printed_questions';
const getPrintedSet = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
};
const savePrintedSet = (set) => localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));

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
    const [text,    setText]    = useState(initial?.questionText ?? '');
    const [qId,     setQId]     = useState(initial?.id ?? '');
    const [options, setOptions] = useState(
        initial?.options ? initial.options.map(o => ({ ...o })) : [{ id: '', label: '' }, { id: '', label: '' }]
    );
    const [saving, setSaving] = useState(false);
    const [err,    setErr]    = useState('');

    const handleTextChange = (val) => {
        setText(val);
        if (isNew) setQId(slugify(val));
    };

    const handleOptLabel = (idx, val) => {
        setOptions(prev => prev.map((o, i) => i === idx ? { ...o, label: val, id: isNew ? optionSlug(val) : o.id } : o));
    };

    const addOption = () => setOptions(prev => [...prev, { id: '', label: '' }]);
    const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx));

    const handleSave = async () => {
        if (!text.trim()) { setErr('Wpisz treść pytania.'); return; }
        if (!qId.trim())  { setErr('ID pytania nie może być puste.'); return; }
        if (options.some(o => !o.label.trim())) { setErr('Każda odpowiedź musi mieć treść.'); return; }
        setSaving(true);
        setErr('');
        try {
            await onSave({
                id: qId.trim(),
                questionText: text.trim(),
                options: options.map(o => ({
                    id: o.id || optionSlug(o.label),
                    label: o.label.trim(),
                })),
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
                <label className='ct-label'>Odpowiedzi</label>
                <div className='ct-options'>
                    {options.map((opt, idx) => (
                        <div key={idx} className='ct-option-row'>
                            <input
                                className='ct-input'
                                value={opt.label}
                                onChange={e => handleOptLabel(idx, e.target.value)}
                                placeholder={`opcja ${idx + 1}`}
                            />
                            {options.length > 2 && (
                                <button type='button' className='ct-remove-btn' onClick={() => removeOption(idx)}>✕</button>
                            )}
                        </div>
                    ))}
                    <button type='button' className='ct-add-btn' onClick={addOption}>+ dodaj odpowiedź</button>
                </div>
            </div>
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
const ContentTab = () => {
    const { questions, facts, refresh } = useData();
    const [section,          setSection]          = useState('pytania'); // 'pytania' | 'ciekawostki'
    const [editingId,        setEditingId]        = useState(null);
    const [addingNew,        setAddingNew]        = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [stickerQ,         setStickerQ]         = useState(null);
    const [printed,          setPrinted]          = useState(getPrintedSet);

    const togglePrinted = (id) => {
        setPrinted(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            savePrintedSet(next);
            return next;
        });
    };

    // ── Pytania — zapis ──────────────────────────────────────────────────────
    const saveQuestion = useCallback(async (data) => {
        await setDoc(doc(db, 'questions', data.id), {
            questionText: data.questionText,
            options:      data.options,
            number:       data.number,
        });
        await refresh();
        setEditingId(null);
        setAddingNew(false);
    }, [refresh]);

    // ── Ciekawostki — zapis ──────────────────────────────────────────────────
    const saveFact = useCallback(async (factId, data, number, active) => {
        await setDoc(doc(db, 'facts', factId), {
            text:   data.text,
            number: number,
            active: active !== false,
        });
        await refresh();
        setEditingId(null);
        setAddingNew(false);
    }, [refresh]);

    const addFact = useCallback(async (data) => {
        const maxNum = facts ? Math.max(0, ...facts.map(f => f.number || 0)) : 0;
        const newId  = String(maxNum + 1).padStart(4, '0');
        await setDoc(doc(db, 'facts', newId), {
            text:   data.text,
            number: maxNum + 1,
            active: true,
        });
        await refresh();
        setAddingNew(false);
    }, [facts, refresh]);

    const toggleFactActive = useCallback(async (fact) => {
        const newActive = fact.active === false ? true : false;
        await updateDoc(doc(db, 'facts', fact.id), { active: newActive });
        await refresh();
    }, [refresh]);

    // ── Usuwanie ─────────────────────────────────────────────────────────────
    const deleteQuestion = useCallback(async (id) => {
        await deleteDoc(doc(db, 'questions', id));
        await refresh();
        setConfirmingDelete(null);
        setEditingId(null);
    }, [refresh]);

    const deleteFact = useCallback(async (id) => {
        await deleteDoc(doc(db, 'facts', id));
        await refresh();
        setConfirmingDelete(null);
        setEditingId(null);
    }, [refresh]);

    if (!questions || !facts) {
        return <div className='tab-empty'><div className='tab-spinner' /></div>;
    }

    const sortedQuestions = Object.entries(questions)
        .map(([id, q]) => ({ id, ...q }))
        .sort((a, b) => (a.number || 0) - (b.number || 0));

    const maxQNumber = sortedQuestions.length > 0 ? Math.max(...sortedQuestions.map(q => q.number || 0)) : 0;

    return (
        <div className='content-tab'>
            {/* Przełącznik sekcji */}
            <div className='ct-section-toggle'>
                <button
                    type='button'
                    className={`ct-section-btn${section === 'pytania' ? ' active' : ''}`}
                    onClick={() => { setSection('pytania'); setEditingId(null); setAddingNew(false); setConfirmingDelete(null); }}
                >
                    Pytania <span className='ct-count'>{sortedQuestions.length}</span>
                </button>
                <button
                    type='button'
                    className={`ct-section-btn${section === 'ciekawostki' ? ' active' : ''}`}
                    onClick={() => { setSection('ciekawostki'); setEditingId(null); setAddingNew(false); setConfirmingDelete(null); }}
                >
                    Ciekawostki <span className='ct-count'>{facts.length}</span>
                </button>
            </div>

            {/* ── PYTANIA ── */}
            {section === 'pytania' && (
                <div className='ct-list'>
                    {sortedQuestions.map(q => (
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
                                        className={`ct-print-btn${printed.has(q.id) ? ' active' : ''}`}
                                        onClick={() => togglePrinted(q.id)}
                                        title={printed.has(q.id) ? 'Wydrukowane' : 'Oznacz jako wydrukowane'}
                                    ><FontAwesomeIcon icon={faPrint} /></button>
                                    <button
                                        type='button'
                                        className='ct-sticker-btn'
                                        onClick={() => { setStickerQ(q); setEditingId(null); setAddingNew(false); setConfirmingDelete(null); }}
                                        title='Generuj naklejki'
                                    ><FontAwesomeIcon icon={faQrcode} /></button>
                                    <button
                                        type='button'
                                        className='ct-edit-btn'
                                        onClick={() => { setEditingId(q.id); setAddingNew(false); setConfirmingDelete(null); }}
                                    >✎</button>
                                    <button
                                        type='button'
                                        className='ct-delete-btn'
                                        onClick={() => { setConfirmingDelete(q.id); setEditingId(null); }}
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
                                        className={`ct-active-btn${fact.active === false ? '' : ' active'}`}
                                        onClick={() => toggleFactActive(fact)}
                                        title={fact.active === false ? 'Nieaktywna — kliknij aby dodać do puli' : 'Aktywna w puli losowania'}
                                    ><FontAwesomeIcon icon={fact.active === false ? faToggleOff : faToggleOn} /></button>
                                    <button
                                        type='button'
                                        className='ct-edit-btn'
                                        onClick={() => { setEditingId(fact.id); setAddingNew(false); setConfirmingDelete(null); }}
                                    >✎</button>
                                    <button
                                        type='button'
                                        className='ct-delete-btn'
                                        onClick={() => { setConfirmingDelete(fact.id); setEditingId(null); }}
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
