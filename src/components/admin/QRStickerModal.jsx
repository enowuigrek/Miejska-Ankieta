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

// Arkusz "paski" — komplety (? / pytanie / QR) w jednym kawałku.
// Wartości bazowe dla pasków pionowych (4 kolumny × 2 rzędy); poziome to ta sama
// siatka obrócona o 90° — patrz renderA3SheetCombined.
const A3_COMB_COLS = 4;
const A3_COMB_ROWS = 2;
const A3_COMB_TOTAL = A3_COMB_COLS * A3_COMB_ROWS;

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

function drawNum(ctx, num, w, h, ox = 0, oy = 0) {
    if (!num) return;
    const pad = Math.round(w * 0.03);
    const fs  = Math.round(w * 0.038);
    ctx.save();
    ctx.font         = `700 ${fs}px ${F_SEMI}`;
    ctx.fillStyle    = DARK;
    ctx.globalAlpha  = 0.6;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`#${String(num).padStart(3, '0')}`, ox + w - pad, oy + h - pad);
    ctx.restore();
}

function drawBorder(ctx, w, h, ox = 0, oy = 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.9)';
    ctx.lineWidth   = Math.max(1, Math.round(Math.min(w, h) * 0.004));
    ctx.strokeRect(ox + 1, oy + 1, w - 2, h - 2);
    ctx.restore();
}

// ── Treść: pytanie (bez tła/obramowania — używana samodzielnie i w pasku) ─────
// padRatio:  margines wewnętrzny (0.08 standalone, 0.045 w pasku)
// fontScale: mnożnik fontu (1.0 standalone, 1.2 w pasku)
// valign:    'center' standalone | 'top' w pasku (tekst kotwi się przy górnej granicy)
function drawQuestionContent(ctx, { questionText, options }, sizePx, offsetX = 0, offsetY = 0, padRatio = 0.08, fontScale = 1.0, valign = 'center') {
    const pad  = Math.round(sizePx * padRatio);
    ctx.textBaseline = 'top';

    // Pytania allowText (z opcją type:text) — samo pytanie, bez opcji
    const isOpenQuestion = options.some(o => o.type === 'text');
    const visibleOptions = isOpenQuestion ? [] : options;

    const qLen  = questionText.length;
    const fsQ   = Math.round(sizePx * (qLen > 40 ? 0.076 : qLen > 20 ? 0.096 : 0.115) * fontScale);
    const scale      = visibleOptions.length >= 5 ? 0.78 : visibleOptions.length >= 4 ? 0.88 : 1;
    const fsOpt      = Math.round(sizePx * 0.072 * scale * fontScale);
    const lineH_cont = Math.round(fsOpt * 1.1);
    const lineH_opt  = Math.round(fsOpt * 1.85);

    const maxW = sizePx - pad * 2;
    ctx.font    = `${fsQ}px ${F_HEAVY}`;
    const lines = wrapText(ctx, questionText, maxW);
    const textH = lines.length * Math.round(fsQ * 1.15);

    ctx.font = `600 ${fsOpt}px ${F_SEMI}`;
    const optLines = visibleOptions.map(opt => wrapText(ctx, opt.label, maxW));

    let optsH = 0;
    optLines.forEach(wrappedLines => { optsH += wrappedLines.length * lineH_cont; });
    if (optLines.length > 1) optsH += (optLines.length - 1) * (lineH_opt - lineH_cont);

    const gapQ   = visibleOptions.length > 0 ? Math.round(sizePx * 0.06) : 0;
    const totalH = textH + gapQ + optsH;
    const nudge  = Math.round(sizePx * 0.03);
    const x      = offsetX + pad;

    // valign 'top': kotwica przy górnej granicy (pas pasek — tuż po ? modułu powyżej)
    // valign 'center': wycentrowany pionowo (samodzielna naklejka)
    let y = valign === 'top'
        ? offsetY + pad
        : offsetY + Math.max(pad, Math.round((sizePx - totalH) / 2) + nudge);

    // Pytanie — Archivo Black
    ctx.font      = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'left';
    lines.forEach(line => { ctx.fillText(line, x, y); y += Math.round(fsQ * 1.15); });

    // Ozdobnik: krótka linia pod tytułem pytania (motyw podkreślenia z nagłówków apki)
    // Tylko w trybie 'top' (pasek) — na samodzielnej naklejce jest za ciasno
    if (valign === 'top') {
        const ulW = Math.round(sizePx * 0.38);
        const ulH = Math.max(2, Math.round(sizePx * 0.006));
        const ulY = y + Math.round(fsQ * 0.18);
        ctx.save();
        ctx.fillStyle   = DARK;
        ctx.globalAlpha = 0.28;
        ctx.fillRect(x, ulY, ulW, ulH);
        ctx.restore();
        y += Math.round(fsQ * 0.55); // gap po linii dekoracyjnej
    }

    if (visibleOptions.length > 0) {
        y += gapQ;
        // Opcje — Urbanist 600, ciemne ale nie bold
        ctx.font        = `600 ${fsOpt}px ${F_SEMI}`;
        ctx.fillStyle   = DARK;
        ctx.globalAlpha = 0.82;
        ctx.textAlign   = 'left';
        optLines.forEach((wrappedLines, optIdx) => {
            wrappedLines.forEach(line => { ctx.fillText(line, x, y); y += lineH_cont; });
            if (optIdx < optLines.length - 1) y += lineH_opt - lineH_cont;
        });
        ctx.globalAlpha = 1;
    }
}

// ── Treść: kod QR (bez tła/obramowania) ────────────────────────────────────────
// padRatio: 0.05 dla samodzielnej naklejki, mniejszy w pasku (0.02)
async function drawQRContent(ctx, { questionId }, sizePx, offsetX = 0, offsetY = 0, padRatio = 0.05) {
    const pad = Math.round(sizePx * padRatio);
    const qrSz = sizePx - pad * 2;

    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, `https://jakmyslisz.com/${questionId}`, {
        width: qrSz, margin: 1,
        color: { dark: DARK, light: BG },
        errorCorrectionLevel: 'M',
    });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, offsetX + pad, offsetY + pad, qrSz, qrSz);
}

// ── Treść: znak zapytania (bez tła/obramowania) ────────────────────────────────
// fsScale: 0.92 standalone | 0.96 w pasku
// valign:  'center' standalone | 'bottom' w pasku (? schodzi na dół modułu,
//          kropka blisko granicy z modułem pytania — zero wizualnej luki)
function drawQMarkContent(ctx, sizePx, offsetX = 0, offsetY = 0, fsScale = 0.92, valign = 'center') {
    const fs = Math.round(sizePx * fsScale);
    ctx.save();
    ctx.font         = `${fs}px ${F_HEAVY}`;
    ctx.fillStyle    = '#FF2323';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';

    const m  = ctx.measureText('?');
    const tH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;

    // 'bottom': baseline ustawiony tak, żeby dolna krawędź kropki była ~94% modułu
    // 'center': klasyczne centrowanie na podstawie rzeczywistych metryk
    const y = valign === 'bottom'
        ? offsetY + sizePx * 0.94 - m.actualBoundingBoxDescent
        : offsetY + (sizePx + tH) / 2 - m.actualBoundingBoxDescent;

    ctx.fillText('?', offsetX + sizePx / 2, y);
    ctx.restore();
}

// ── Naklejka z pytaniem ───────────────────────────────────────────────────────
async function renderQuestionSticker(canvas, { questionText, options, questionNum, sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx  = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    drawQuestionContent(ctx, { questionText, options }, sizePx, 0, 0);
    drawNum(ctx, questionNum, sizePx, sizePx);
    drawBorder(ctx, sizePx, sizePx);
}

// ── Naklejka QR ───────────────────────────────────────────────────────────────
async function renderBareQRSticker(canvas, { questionId, questionNum, sizePx }) {
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    await drawQRContent(ctx, { questionId }, sizePx, 0, 0);

    drawNum(ctx, questionNum, sizePx, sizePx);
    drawBorder(ctx, sizePx, sizePx);
}

// ── Naklejka ze znakiem zapytania ─────────────────────────────────────────────
async function renderQMarkSticker(canvas, { sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    drawQMarkContent(ctx, sizePx, 0, 0);
    drawBorder(ctx, sizePx, sizePx);
}

// ── Pasek: znak ? / pytanie / QR w jednym kawałku, bez linii wewnętrznych ─────
// orientation: 'pionowy' (od góry do dołu) | 'poziomy' (od lewej do prawej)
async function renderCombinedSticker(canvas, { questionText, questionId, options, questionNum, sizePx, orientation = 'pionowy' }) {
    await waitForFonts();
    const horizontal = orientation === 'poziomy';

    const w = horizontal ? sizePx * 3 : sizePx;
    const h = horizontal ? sizePx : sizePx * 3;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    // Pasek: każdy moduł używa ciasnych marginesów i zakotwiczenia przy granicy.
    // ? valign='bottom' → kropka przy dolnej krawędzi modułu
    // pytanie valign='top' → tekst przy górnej krawędzi modułu (tuż po ?)
    // fontScale 1.2 → tekst ~20% większy niż na samodzielnej naklejce
    // QR pad 2% → kod wypełnia 96% modułu
    if (horizontal) {
        drawQMarkContent(ctx, sizePx, 0, 0, 0.96, 'bottom');
        drawQuestionContent(ctx, { questionText, options }, sizePx, sizePx, 0, 0.045, 1.2, 'top');
        await drawQRContent(ctx, { questionId }, sizePx, sizePx * 2, 0, 0.02);
        drawNum(ctx, questionNum, sizePx, sizePx, sizePx * 2, 0);
    } else {
        drawQMarkContent(ctx, sizePx, 0, 0, 0.96, 'bottom');
        drawQuestionContent(ctx, { questionText, options }, sizePx, 0, sizePx, 0.045, 1.2, 'top');
        await drawQRContent(ctx, { questionId }, sizePx, 0, sizePx * 2, 0.02);
        drawNum(ctx, questionNum, sizePx, sizePx, 0, sizePx * 2);
    }

    // Ozdobnik: cienkie separatory między modułami (echo borderu z apki, ~12% opacity)
    const sepThick = Math.max(1, Math.round(sizePx * 0.004));
    ctx.save();
    ctx.fillStyle   = DARK;
    ctx.globalAlpha = 0.12;
    if (horizontal) {
        ctx.fillRect(sizePx - Math.ceil(sepThick / 2), 0, sepThick, sizePx);
        ctx.fillRect(sizePx * 2 - Math.ceil(sepThick / 2), 0, sepThick, sizePx);
    } else {
        ctx.fillRect(0, sizePx - Math.ceil(sepThick / 2), sizePx, sepThick);
        ctx.fillRect(0, sizePx * 2 - Math.ceil(sepThick / 2), sizePx, sepThick);
    }
    ctx.restore();

    drawBorder(ctx, w, h); // obramowanie całości — separatory wewnątrz
}

// ── Arkusz A3 — 16 naklejek ───────────────────────────────────────────────────
async function renderA3Sheet(canvas, { questionText, questionId, options, questionNum, counts }) {
    await waitForFonts();

    const mm      = (v) => Math.round(v * DPI / 25.4);
    const W       = mm(297);
    const H       = mm(420);
    const MARGIN  = mm(10);
    const GAP     = 0;

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

}

// ── Arkusz A3 "paski" — 8 kompletnych pasków (? / pytanie / QR) ───────────────
// pionowo: arkusz portret 297×420, siatka 4×2, paski 1×3 sekcji (z góry na dół)
// poziomo: arkusz obrócony o 90° — 420×297, siatka 2×4, paski 3×1 sekcji (z lewa na prawo)
async function renderA3SheetCombined(canvas, { questionText, questionId, options, questionNum, orientation = 'pionowy' }) {
    await waitForFonts();
    const horizontal = orientation === 'poziomy';

    const mm     = (v) => Math.round(v * DPI / 25.4);
    const W      = horizontal ? mm(420) : mm(297);
    const H      = horizontal ? mm(297) : mm(420);
    const MARGIN = mm(10);

    const availW = W - 2 * MARGIN;
    const availH = H - 2 * MARGIN;

    // przy poziomym pasku kolumny/wiersze się zamieniają miejscami (siatka obrócona razem z paskiem)
    const gridCols = horizontal ? A3_COMB_ROWS : A3_COMB_COLS;
    const gridRows = horizontal ? A3_COMB_COLS : A3_COMB_ROWS;

    const sectionSize = horizontal
        ? Math.floor(Math.min(availW / (gridCols * 3), availH / gridRows))
        : Math.floor(Math.min(availW / gridCols, availH / (gridRows * 3)));

    const cardW = horizontal ? sectionSize * 3 : sectionSize;
    const cardH = horizontal ? sectionSize : sectionSize * 3;

    const gridW  = gridCols * cardW;
    const gridH  = gridRows * cardH;
    const startX = Math.round((W - gridW) / 2);
    const startY = Math.round((H - gridH) / 2);

    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    const args = { questionText, questionId, options, questionNum, sizePx: sectionSize, orientation };

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const x = startX + col * cardW;
            const y = startY + row * cardH;

            const sc = document.createElement('canvas');
            await renderCombinedSticker(sc, args);
            ctx.drawImage(sc, x, y);
        }
    }
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
    { id: 'qmark',   label: '?'       },
    { id: 'pytanie', label: 'pytanie' },
    { id: 'goly',    label: 'QR'      },
    { id: 'pasek',   label: 'pasek'   },
];

const QRStickerModal = ({ questionId, questionText, options = [], questionNum, onClose }) => {
    const [tab,              setTab]              = useState('pytanie');
    const [sizeMM,           setSizeMM]           = useState(80);
    const [rendering,        setRendering]        = useState(false);
    const [sheetMode,        setSheetMode]        = useState('rozdzielone'); // 'rozdzielone' | 'pasek'
    const [pasekOrientation, setPasekOrientation] = useState('pionowy');     // 'pionowy' | 'poziomy'
    const [sheetCounts,      setSheetCounts]      = useState({ pytanie: 8, qr: 8, qmark: 8 });
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
            else if (tab === 'pasek')   await renderCombinedSticker(previewRef.current, { ...args, orientation: pasekOrientation });
            else                        await renderBareQRSticker(previewRef.current, args);
        } catch (e) { console.error('Sticker render error:', e); }
        finally     { setRendering(false); }
    }, [tab, questionText, questionId, options, questionNum, pasekOrientation]);

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
            const num = String(questionNum).padStart(3, '0');
            let suffix;
            if      (tab === 'pytanie') { await renderQuestionSticker(exp, args); suffix = `${num}-pytanie`; }
            else if (tab === 'qmark')   { await renderQMarkSticker(exp, args); suffix = 'znak-zapytania'; }
            else if (tab === 'pasek')   { await renderCombinedSticker(exp, { ...args, orientation: pasekOrientation }); suffix = `${num}-pasek-${pasekOrientation}`; }
            else                        { await renderBareQRSticker(exp, args); suffix = `${num}-${tab}`; }
            downloadCanvas(exp, `jakmyslisz-${suffix}-${sizeMM}mm-300dpi.png`);
        } catch (e) { console.error('Download error:', e); }
    }, [tab, questionText, questionId, options, questionNum, sizeMM, pasekOrientation]);

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
        if (sheetMode === 'rozdzielone' && !sheetOk) return;
        setRendering(true);
        try {
            const exp = document.createElement('canvas');
            const num = String(questionNum).padStart(3, '0');
            if (sheetMode === 'pasek') {
                await renderA3SheetCombined(exp, { questionText, questionId, options, questionNum, orientation: pasekOrientation });
                downloadCanvas(exp, `jakmyslisz-${num}-arkusz-a3-paski-${pasekOrientation}-300dpi.png`);
            } else {
                await renderA3Sheet(exp, { questionText, questionId, options, questionNum, counts: sheetCounts });
                downloadCanvas(exp, `jakmyslisz-${num}-arkusz-a3-300dpi.png`);
            }
        } catch (e) { console.error('Sheet render error:', e); }
        finally     { setRendering(false); }
    }, [questionText, questionId, options, questionNum, sheetCounts, sheetOk, sheetMode, pasekOrientation]);

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

                {tab === 'pasek' && (
                    <div className='qr-tabs qr-orientation-tabs'>
                        <button type='button'
                            className={`qr-tab${pasekOrientation === 'pionowy' ? ' active' : ''}`}
                            onClick={() => setPasekOrientation('pionowy')}
                        >pionowy</button>
                        <button type='button'
                            className={`qr-tab${pasekOrientation === 'poziomy' ? ' active' : ''}`}
                            onClick={() => setPasekOrientation('poziomy')}
                        >poziomy</button>
                    </div>
                )}

                <div className='qr-preview-wrap'>
                    <canvas
                        ref={previewRef}
                        width={PREVIEW_PX} height={PREVIEW_PX}
                        className={`qr-preview-canvas${tab === 'pasek' ? ` qr-preview-canvas--pasek-${pasekOrientation}` : ''}`}
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
                    <div className='qr-sheet-title'>arkusz A3</div>

                    <div className='qr-tabs qr-sheet-mode-tabs'>
                        <button type='button'
                            className={`qr-tab${sheetMode === 'rozdzielone' ? ' active' : ''}`}
                            onClick={() => setSheetMode('rozdzielone')}
                        >rozdzielone</button>
                        <button type='button'
                            className={`qr-tab${sheetMode === 'pasek' ? ' active' : ''}`}
                            onClick={() => setSheetMode('pasek')}
                        >paski</button>
                    </div>

                    {sheetMode === 'rozdzielone' ? (
                        <>
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
                            <div className='qr-sheet-hint'>{A3_TOTAL} osobnych naklejek (4×6) — każda z czarną ramką, do wycięcia pojedynczo.</div>
                        </>
                    ) : (
                        <>
                            <div className='qr-tabs qr-orientation-tabs'>
                                <button type='button'
                                    className={`qr-tab${pasekOrientation === 'pionowy' ? ' active' : ''}`}
                                    onClick={() => setPasekOrientation('pionowy')}
                                >pionowy</button>
                                <button type='button'
                                    className={`qr-tab${pasekOrientation === 'poziomy' ? ' active' : ''}`}
                                    onClick={() => setPasekOrientation('poziomy')}
                                >poziomy</button>
                            </div>
                            <div className='qr-sheet-hint'>
                                {pasekOrientation === 'pionowy' ? (
                                    <>{A3_COMB_TOTAL} kompletnych pasków (4×{A3_COMB_ROWS}) — znak ? na górze, pytanie w środku, QR na dole, bez linii wewnątrz. Wystarczy wyciąć w pionowe paski, a potem przeciąć poziomo.</>
                                ) : (
                                    <>{A3_COMB_TOTAL} kompletnych pasków ({A3_COMB_ROWS}×{A3_COMB_COLS}, arkusz poziomy) — znak ? z lewej, pytanie w środku, QR z prawej, bez linii wewnątrz. Wystarczy wyciąć w poziome paski, a potem przeciąć pionowo.</>
                                )}
                            </div>
                        </>
                    )}

                    <button
                        type='button'
                        className='qr-download-btn qr-sheet-btn'
                        onClick={handleDownloadSheet}
                        disabled={rendering || (sheetMode === 'rozdzielone' && !sheetOk)}
                    >
                        ↓ pobierz arkusz A3 — 300 dpi
                    </button>
                </div>

            </div>
        </div>
    );
};

export default QRStickerModal;
