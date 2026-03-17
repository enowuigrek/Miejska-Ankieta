import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import './QRStickerModal.scss';

const DARK    = '#454545';
const BG      = '#ffffff';
const F_HEAVY = '"Archivo Black", "Arial Black", Impact, sans-serif';
const F_SEMI  = '"Urbanist", "Arial", sans-serif';

const PREVIEW_PX  = 560;
const DPI         = 300;
const A3_TOTAL    = 24;
const A3_COLS     = 4;
const A3_ROWS     = 6;

async function waitForFonts() {
    if (document.fonts) {
        await Promise.all([
            document.fonts.load(`800 20px "Archivo Black"`).catch(() => {}),
            document.fonts.load(`600 20px "Urbanist"`).catch(() => {}),
        ]);
    }
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    if (ctx.measureText(text).width <= maxWidth) return [text];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
        const test = cur + ' ' + words[i];
        if (ctx.measureText(test).width > maxWidth) { lines.push(cur); cur = words[i]; }
        else cur = test;
    }
    lines.push(cur);
    return lines;
}

function drawNum(ctx, num, sizePx) {
    if (!num) return;
    const pad = Math.round(sizePx * 0.05);
    const fs  = Math.round(sizePx * 0.03);
    ctx.save();
    ctx.font         = `${fs}px ${F_HEAVY}`;
    ctx.fillStyle    = DARK;
    ctx.globalAlpha  = 0.28;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`#${String(num).padStart(3, '0')}`, sizePx - pad, sizePx - pad);
    ctx.restore();
}

function drawBorder(ctx, sizePx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(120, 120, 120, 0.25)';
    ctx.lineWidth   = Math.max(1, Math.round(sizePx * 0.004));
    ctx.strokeRect(1, 1, sizePx - 2, sizePx - 2);
    ctx.restore();
}

// ── Naklejka z pytaniem ───────────────────────────────────────────────────────
async function renderQuestionSticker(canvas, { questionText, options, questionNum, sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx  = canvas.getContext('2d');
    const pad  = Math.round(sizePx * 0.08);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);
    ctx.textBaseline = 'top';

    const qLen  = questionText.length;
    const fsQ   = Math.round(sizePx * (qLen > 40 ? 0.076 : qLen > 20 ? 0.096 : 0.115));
    const scale      = options.length >= 5 ? 0.78 : options.length >= 4 ? 0.88 : 1;
    const fsOpt      = Math.round(sizePx * 0.072 * scale);
    const lineH_cont = Math.round(fsOpt * 1.1);
    const lineH_opt  = Math.round(fsOpt * 1.85);

    const maxW = sizePx - pad * 2;
    ctx.font    = `${fsQ}px ${F_HEAVY}`;
    const lines = wrapText(ctx, questionText, maxW);
    const textH = lines.length * Math.round(fsQ * 1.15);

    ctx.font = `600 ${fsOpt}px ${F_SEMI}`;
    const optLines = options.map(opt => wrapText(ctx, opt.label, maxW));

    let optsH = 0;
    optLines.forEach(wrappedLines => { optsH += wrappedLines.length * lineH_cont; });
    optsH += (optLines.length - 1) * (lineH_opt - lineH_cont);

    const gapQ   = Math.round(sizePx * 0.06);
    const totalH = textH + gapQ + optsH;
    const nudge  = Math.round(sizePx * 0.03);
    let y = Math.max(pad, Math.round((sizePx - totalH) / 2) + nudge);

    // Pytanie — Archivo Black
    ctx.font      = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'left';
    lines.forEach(line => { ctx.fillText(line, pad, y); y += Math.round(fsQ * 1.15); });

    y += gapQ;

    // Opcje — Urbanist 600, ciemne ale nie bold
    ctx.font        = `600 ${fsOpt}px ${F_SEMI}`;
    ctx.fillStyle   = DARK;
    ctx.globalAlpha = 0.82;
    ctx.textAlign   = 'left';
    optLines.forEach((wrappedLines, optIdx) => {
        wrappedLines.forEach(line => { ctx.fillText(line, pad, y); y += lineH_cont; });
        if (optIdx < optLines.length - 1) y += lineH_opt - lineH_cont;
    });
    ctx.globalAlpha = 1;

    drawNum(ctx, questionNum, sizePx);
    drawBorder(ctx, sizePx);
}

// ── Naklejka QR ───────────────────────────────────────────────────────────────
async function renderBareQRSticker(canvas, { questionId, questionNum, sizePx }) {
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    const pad = Math.round(sizePx * 0.05);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    const qrSz     = sizePx - pad * 2;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, `https://jakmyslisz.com/${questionId}`, {
        width: qrSz, margin: 1,
        color: { dark: DARK, light: BG },
        errorCorrectionLevel: 'M',
    });
    canvas.getContext('2d').imageSmoothingEnabled = false;
    canvas.getContext('2d').drawImage(qrCanvas, pad, pad, qrSz, qrSz);

    drawNum(ctx, questionNum, sizePx);
    drawBorder(ctx, sizePx);
}

// ── Naklejka ze znakiem zapytania ─────────────────────────────────────────────
async function renderQMarkSticker(canvas, { sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    const fs = Math.round(sizePx * 0.92);
    ctx.font         = `${fs}px ${F_HEAVY}`;
    ctx.fillStyle    = '#FF2323';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';

    const m  = ctx.measureText('?');
    const tH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const y  = (sizePx + tH) / 2 - m.actualBoundingBoxDescent;

    ctx.fillText('?', sizePx / 2, y);
    drawBorder(ctx, sizePx);
}

// ── Arkusz A3 — 16 naklejek ───────────────────────────────────────────────────
async function renderA3Sheet(canvas, { questionText, questionId, options, questionNum, counts }) {
    await waitForFonts();

    const mm      = (v) => Math.round(v * DPI / 25.4);
    const W       = mm(297);
    const H       = mm(420);
    const MARGIN  = mm(10);
    const GAP     = mm(5);

    const stickerSize = Math.floor((W - 2 * MARGIN - (A3_COLS - 1) * GAP) / A3_COLS);
    const gridW  = A3_COLS * stickerSize + (A3_COLS - 1) * GAP;
    const gridH  = A3_ROWS * stickerSize + (A3_ROWS - 1) * GAP;
    const startX = Math.round((W - gridW) / 2);
    const startY = Math.round((H - gridH) / 2);

    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Kolejność: pytania → QR → znaki ?
    const types = [];
    for (let i = 0; i < counts.pytanie; i++) types.push('pytanie');
    for (let i = 0; i < counts.qr;      i++) types.push('qr');
    for (let i = 0; i < counts.qmark;   i++) types.push('qmark');

    const args = { questionText, questionId, options, questionNum, sizePx: stickerSize };

    for (let i = 0; i < A3_TOTAL; i++) {
        const col = i % A3_COLS;
        const row = Math.floor(i / A3_COLS);
        const x   = startX + col * (stickerSize + GAP);
        const y   = startY + row * (stickerSize + GAP);

        const sc   = document.createElement('canvas');
        const type = types[i] || 'qmark';

        if      (type === 'pytanie') await renderQuestionSticker(sc, args);
        else if (type === 'qr')      await renderBareQRSticker(sc, args);
        else                         await renderQMarkSticker(sc, args);

        ctx.drawImage(sc, x, y);
    }

    // Linie cięcia — przerywane między kolumnami i wierszami
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([mm(3), mm(3)]);

    for (let col = 1; col < A3_COLS; col++) {
        const lx = startX + col * (stickerSize + GAP) - Math.round(GAP / 2);
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
    }
    for (let row = 1; row < A3_ROWS; row++) {
        const ly = startY + row * (stickerSize + GAP) - Math.round(GAP / 2);
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
    }

    // Linia krawędzi arkusza (górna/dolna/lewa/prawa)
    const edgeLines = [
        [startX, 0, startX, H],
        [startX + gridW, 0, startX + gridW, H],
        [0, startY, W, startY],
        [0, startY + gridH, W, startY + gridH],
    ];
    edgeLines.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });

    ctx.restore();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function downloadCanvas(canvas, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ── Taby pojedynczych naklejek ────────────────────────────────────────────────
const TABS = [
    { id: 'pytanie', label: 'pytanie' },
    { id: 'goly',    label: 'QR'      },
    { id: 'qmark',   label: '?'       },
];

const QRStickerModal = ({ questionId, questionText, options = [], questionNum, onClose }) => {
    const [tab,         setTab]         = useState('pytanie');
    const [sizeMM,      setSizeMM]      = useState(80);
    const [rendering,   setRendering]   = useState(false);
    const [sheetCounts, setSheetCounts] = useState({ pytanie: 8, qr: 8, qmark: 8 });
    const previewRef = useRef(null);

    const sheetTotal = sheetCounts.pytanie + sheetCounts.qr + sheetCounts.qmark;
    const sheetOk    = sheetTotal === A3_TOTAL;

    const renderPreview = useCallback(async () => {
        if (!previewRef.current) return;
        setRendering(true);
        try {
            const args = { questionText, questionId, options, questionNum, sizePx: PREVIEW_PX };
            if      (tab === 'pytanie') await renderQuestionSticker(previewRef.current, args);
            else if (tab === 'qmark')   await renderQMarkSticker(previewRef.current, args);
            else                        await renderBareQRSticker(previewRef.current, args);
        } catch (e) { console.error('Sticker render error:', e); }
        finally     { setRendering(false); }
    }, [tab, questionText, questionId, options, questionNum]);

    useEffect(() => { renderPreview(); }, [renderPreview]);

    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const handleDownload = useCallback(async () => {
        const sizePx = Math.round((sizeMM / 25.4) * DPI);
        const exp    = document.createElement('canvas');
        const args   = { questionText, questionId, options, questionNum, sizePx };
        try {
            if      (tab === 'pytanie') await renderQuestionSticker(exp, args);
            else if (tab === 'qmark')   await renderQMarkSticker(exp, args);
            else                        await renderBareQRSticker(exp, args);
            const suffix = tab === 'qmark' ? 'znak-zapytania' : `${String(questionNum).padStart(3,'0')}-${tab}`;
            downloadCanvas(exp, `jakmyslisz-${suffix}-${sizeMM}mm-300dpi.png`);
        } catch (e) { console.error('Download error:', e); }
    }, [tab, questionText, questionId, options, questionNum, sizeMM]);

    const handleDownloadAll = useCallback(async () => {
        setRendering(true);
        try {
            const sizePx = Math.round((sizeMM / 25.4) * DPI);
            const args   = { questionText, questionId, options, questionNum, sizePx };
            const num    = String(questionNum).padStart(3, '0');
            const tasks  = [
                { fn: renderQuestionSticker, suffix: `${num}-pytanie` },
                { fn: renderBareQRSticker,   suffix: `${num}-qr`      },
                { fn: renderQMarkSticker,    suffix: 'znak-zapytania'  },
            ];
            for (const task of tasks) {
                const c = document.createElement('canvas');
                await task.fn(c, args);
                downloadCanvas(c, `jakmyslisz-${task.suffix}-${sizeMM}mm-300dpi.png`);
                await new Promise(r => setTimeout(r, 250));
            }
        } catch (e) { console.error('Download all error:', e); }
        finally     { setRendering(false); }
    }, [questionText, questionId, options, questionNum, sizeMM]);

    const handleDownloadSheet = useCallback(async () => {
        if (!sheetOk) return;
        setRendering(true);
        try {
            const exp  = document.createElement('canvas');
            await renderA3Sheet(exp, { questionText, questionId, options, questionNum, counts: sheetCounts });
            const num  = String(questionNum).padStart(3, '0');
            downloadCanvas(exp, `jakmyslisz-${num}-arkusz-a3-300dpi.png`);
        } catch (e) { console.error('Sheet render error:', e); }
        finally     { setRendering(false); }
    }, [questionText, questionId, options, questionNum, sheetCounts, sheetOk]);

    const setCount = (key, val) => {
        const v = Math.max(0, Math.min(A3_TOTAL, parseInt(val) || 0));
        setSheetCounts(prev => ({ ...prev, [key]: v }));
    };

    return (
        <div className='qr-overlay' onClick={onClose}>
            <div className='qr-modal' onClick={e => e.stopPropagation()}>

                <div className='qr-modal-header'>
                    <div>
                        <div className='qr-modal-label'>
                            naklejki do druku — <span className='qr-modal-num'>#{String(questionNum).padStart(3,'0')}</span>
                        </div>
                        <div className='qr-modal-question'>{questionText}</div>
                    </div>
                    <button type='button' className='qr-close-btn' onClick={onClose}>✕</button>
                </div>

                <div className='qr-tabs'>
                    {TABS.map(t => (
                        <button key={t.id} type='button'
                            className={`qr-tab${tab === t.id ? ' active' : ''}`}
                            onClick={() => setTab(t.id)}
                        >{t.label}</button>
                    ))}
                </div>

                <div className='qr-preview-wrap'>
                    <canvas
                        ref={previewRef}
                        width={PREVIEW_PX} height={PREVIEW_PX}
                        className='qr-preview-canvas'
                        style={{ opacity: rendering ? 0.3 : 1 }}
                    />
                </div>

                <div className='qr-controls'>
                    <div className='qr-control'>
                        <label className='qr-control-label'>rozmiar</label>
                        <select className='qr-select' value={sizeMM} onChange={e => setSizeMM(+e.target.value)}>
                            <option value={80}>80 mm</option>
                            <option value={120}>120 mm</option>
                        </select>
                    </div>
                </div>

                <button type='button' className='qr-download-btn' onClick={handleDownloadAll} disabled={rendering}>
                    ↓ pobierz wszystkie 3 — {sizeMM}×{sizeMM} mm
                </button>
                <button type='button' className='qr-download-btn qr-download-btn--secondary' onClick={handleDownload} disabled={rendering}>
                    ↓ pobierz tylko ten
                </button>

                {/* ── Arkusz A3 ── */}
                <div className='qr-sheet-divider' />

                <div className='qr-sheet-section'>
                    <div className='qr-sheet-title'>arkusz A3 — {A3_TOTAL} naklejek (4×6)</div>
                    <div className='qr-sheet-row'>
                        <div className='qr-sheet-field'>
                            <label className='qr-sheet-label'>pytania</label>
                            <input
                                type='number' min={0} max={A3_TOTAL}
                                className='qr-sheet-input'
                                value={sheetCounts.pytanie}
                                onChange={e => setCount('pytanie', e.target.value)}
                            />
                        </div>
                        <div className='qr-sheet-field'>
                            <label className='qr-sheet-label'>kody QR</label>
                            <input
                                type='number' min={0} max={A3_TOTAL}
                                className='qr-sheet-input'
                                value={sheetCounts.qr}
                                onChange={e => setCount('qr', e.target.value)}
                            />
                        </div>
                        <div className='qr-sheet-field'>
                            <label className='qr-sheet-label'>znaki ?</label>
                            <input
                                type='number' min={0} max={A3_TOTAL}
                                className='qr-sheet-input'
                                value={sheetCounts.qmark}
                                onChange={e => setCount('qmark', e.target.value)}
                            />
                        </div>
                        <div className={`qr-sheet-total${sheetOk ? ' ok' : ' err'}`}>
                            = {sheetTotal}
                        </div>
                    </div>
                    <button
                        type='button'
                        className='qr-download-btn qr-sheet-btn'
                        onClick={handleDownloadSheet}
                        disabled={rendering || !sheetOk}
                    >
                        ↓ pobierz arkusz A3 — 300 dpi
                    </button>
                </div>

            </div>
        </div>
    );
};

export default QRStickerModal;
