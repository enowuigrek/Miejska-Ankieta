import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { QUESTIONS_DATA } from '../../data/questionsData';
import './QRStickerModal.scss';

const DARK = '#454545';
const BG   = '#f3f2f2';
const F_HEAVY = '"Archivo Black", "Arial Black", Impact, sans-serif';

const PREVIEW_PX  = 560;
const Q_KEYS      = Object.keys(QUESTIONS_DATA);
const getQNum     = id => Q_KEYS.indexOf(id) + 1;   // 1-based, 0 = not found

async function waitForFonts() {
    if (document.fonts) {
        await document.fonts.load(`800 20px "Archivo Black"`).catch(() => {});
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

// Numer #001 w prawym dolnym rogu
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

// ── Naklejka z pytaniem — pytanie (do lewej) + opcje jako tekst ───────────────
async function renderQuestionSticker(canvas, { questionText, options, questionNum, sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx  = canvas.getContext('2d');
    const pad  = Math.round(sizePx * 0.08);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);
    ctx.textBaseline = 'top';

    // — Rozmiary —
    const qLen  = questionText.length;
    const fsQ   = Math.round(sizePx * (qLen > 40 ? 0.066 : qLen > 20 ? 0.084 : 0.102));
    const scale = options.length >= 5 ? 0.78 : options.length >= 4 ? 0.88 : 1;
    const fsOpt = Math.round(sizePx * 0.072 * scale);
    const fsCzy = Math.round(sizePx * 0.056 * scale);
    const lineH = Math.round(fsOpt * 1.38);
    const czyH  = Math.round(fsCzy * 1.28);
    const czyX  = pad + Math.round(sizePx * 0.025);  // lekkie wcięcie dla "czy"

    // — Mierzenie —
    ctx.font    = `${fsQ}px ${F_HEAVY}`;
    const lines = wrapText(ctx, questionText, sizePx - pad * 2);
    const textH = lines.length * Math.round(fsQ * 1.15);

    let optsH = 0;
    options.forEach((_, i) => {
        if (i === options.length - 1 && options.length > 1) optsH += czyH;
        optsH += lineH;
    });

    const gapQ   = Math.round(sizePx * 0.06);
    const totalH = textH + gapQ + optsH;
    let y = Math.max(pad, Math.round((sizePx - totalH) / 2));

    // — Rysowanie pytania —
    ctx.font      = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'left';
    lines.forEach(line => { ctx.fillText(line, pad, y); y += Math.round(fsQ * 1.15); });

    y += gapQ;

    // — Opcje (plain text, wyrównane do lewej) —
    options.forEach((opt, i) => {
        if (i === options.length - 1 && options.length > 1) {
            ctx.font      = `${fsCzy}px ${F_HEAVY}`;
            ctx.fillStyle = DARK;
            ctx.textAlign = 'left';
            ctx.fillText('czy', czyX, y);
            y += czyH;
        }
        ctx.font      = `${fsOpt}px ${F_HEAVY}`;
        ctx.fillStyle = DARK;
        ctx.textAlign = 'left';
        ctx.fillText(opt.label, pad, y);
        y += lineH;
    });

    drawNum(ctx, questionNum, sizePx);
}

// ── Naklejka z samym QR — czysty kwadrat z kodem ─────────────────────────────
async function renderBareQRSticker(canvas, { questionId, questionNum, sizePx }) {
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    const pad = Math.round(sizePx * 0.05);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    const qrSz    = sizePx - pad * 2;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, `https://jakmyslisz.com/${questionId}`, {
        width: qrSz, margin: 1,
        color: { dark: DARK, light: BG },
        errorCorrectionLevel: 'M',
    });
    canvas.getContext('2d').imageSmoothingEnabled = false;
    canvas.getContext('2d').drawImage(qrCanvas, pad, pad, qrSz, qrSz);

    drawNum(ctx, questionNum, sizePx);
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

// ── Modal ─────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'pytanie', label: 'samo pytanie' },
    { id: 'goly',    label: 'goly QR'      },
];

const QRStickerModal = ({ questionId, questionText, onClose }) => {
    const [tab,       setTab]       = useState('pytanie');
    const [sizeMM,    setSizeMM]    = useState(80);
    const [dpi,       setDpi]       = useState(300);
    const [rendering, setRendering] = useState(false);
    const previewRef = useRef(null);

    const options     = QUESTIONS_DATA[questionId]?.options ?? [];
    const questionNum = getQNum(questionId);

    const renderPreview = useCallback(async () => {
        if (!previewRef.current) return;
        setRendering(true);
        try {
            const args = { questionText, questionId, options, questionNum, sizePx: PREVIEW_PX };
            if (tab === 'pytanie') await renderQuestionSticker(previewRef.current, args);
            else                   await renderBareQRSticker(previewRef.current, args);
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
        const sizePx = Math.round((sizeMM / 25.4) * dpi);
        const exp    = document.createElement('canvas');
        const args   = { questionText, questionId, options, questionNum, sizePx };
        try {
            if (tab === 'pytanie') await renderQuestionSticker(exp, args);
            else                   await renderBareQRSticker(exp, args);
            downloadCanvas(exp, `jakmyslisz-${String(questionNum).padStart(3,'0')}-${tab}-${sizeMM}mm-${dpi}dpi.png`);
        } catch (e) { console.error('Download error:', e); }
    }, [tab, questionText, questionId, options, questionNum, sizeMM, dpi]);

    const sizePx = Math.round((sizeMM / 25.4) * dpi);

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
                            <option value={60}>60 mm</option>
                            <option value={80}>80 mm</option>
                            <option value={100}>100 mm</option>
                            <option value={120}>120 mm</option>
                        </select>
                    </div>
                    <div className='qr-control'>
                        <label className='qr-control-label'>jakość</label>
                        <select className='qr-select' value={dpi} onChange={e => setDpi(+e.target.value)}>
                            <option value={150}>150 DPI</option>
                            <option value={300}>300 DPI</option>
                            <option value={600}>600 DPI</option>
                        </select>
                    </div>
                </div>

                <button type='button' className='qr-download-btn' onClick={handleDownload}>
                    ↓ pobierz PNG — {sizeMM}×{sizeMM} mm @ {dpi} DPI ({sizePx}px)
                </button>

            </div>
        </div>
    );
};

export default QRStickerModal;
