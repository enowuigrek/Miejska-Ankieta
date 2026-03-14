import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { QUESTIONS_DATA } from '../../data/questionsData';
import './QRStickerModal.scss';

const DARK   = 'rgb(69, 69, 69)';
const RED    = '#FF2323';
const BG     = 'rgb(243, 242, 242)';
const F_HEAVY = '"Archivo Black", "Arial Black", Impact, sans-serif';
const F_BODY  = '"Urbanist", Arial, sans-serif';

const PREVIEW_PX = 560; // rendered at 2x internally

async function waitForFonts() {
    if (document.fonts) {
        await Promise.all([
            document.fonts.load(`800 16px "Archivo Black"`),
            document.fonts.load(`600 16px "Urbanist"`),
        ]);
    }
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    if (words.length === 1 || ctx.measureText(text).width <= maxWidth) return [text];
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

// ── Naklejka QR ──────────────────────────────────────────────────────────────
async function renderQRSticker(canvas, { questionText, questionId, sizePx }) {
    await waitForFonts();
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    const pad = Math.round(sizePx * 0.07);
    const cx = sizePx / 2;
    const url = `https://jakmyslisz.com/${questionId}`;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    let y = pad;
    ctx.textBaseline = 'top';

    // Logo "jak"
    const fsSmall = Math.round(sizePx * 0.052);
    ctx.font = `${fsSmall}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    ctx.fillText('jak', cx, y);
    y += Math.round(fsSmall * 0.84);

    // Logo "myślisz?"
    const fsBig = Math.round(sizePx * 0.062);
    ctx.font = `${fsBig}px ${F_HEAVY}`;
    const wBase = ctx.measureText('myślisz').width;
    const wQ    = ctx.measureText('?').width;
    const logoStartX = cx - (wBase + wQ) / 2;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'left';
    ctx.fillText('myślisz', logoStartX, y);
    ctx.fillStyle = RED;
    ctx.fillText('?', logoStartX + wBase, y);
    y += Math.round(fsBig * 1.32);

    // Kreska
    ctx.strokeStyle = DARK;
    ctx.lineWidth = Math.max(1, Math.round(sizePx * 0.004));
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(sizePx - pad, y); ctx.stroke();
    y += Math.round(sizePx * 0.038);

    // Pytanie
    const qLen = questionText.length;
    const fsQ = Math.round(sizePx * (qLen > 40 ? 0.052 : qLen > 20 ? 0.066 : 0.082));
    ctx.font = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, questionText, sizePx - pad * 2);
    lines.forEach(line => { ctx.fillText(line, cx, y); y += Math.round(fsQ * 1.18); });
    y += Math.round(sizePx * 0.028);

    // QR
    const qrSize = Math.round(sizePx * 0.45);
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, url, {
        width: qrSize,
        margin: 1,
        color: { dark: DARK, light: BG },
        errorCorrectionLevel: 'M',
    });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, (sizePx - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + Math.round(sizePx * 0.022);

    // URL
    const fsURL = Math.round(sizePx * 0.027);
    ctx.font = `600 ${fsURL}px ${F_BODY}`;
    ctx.fillStyle = DARK;
    ctx.globalAlpha = 0.4;
    ctx.textAlign = 'center';
    ctx.fillText(`jakmyslisz.com/${questionId}`, cx, y);
    ctx.globalAlpha = 1;
}

// ── Naklejka z pytaniem ───────────────────────────────────────────────────────
async function renderQuestionSticker(canvas, { questionText, questionId, options, sizePx }) {
    await waitForFonts();
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    const pad  = Math.round(sizePx * 0.07);
    const padH = Math.round(sizePx * 0.045);
    const cx   = sizePx / 2;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    let y = pad;
    ctx.textBaseline = 'top';

    // Logo
    const fsSmall = Math.round(sizePx * 0.052);
    ctx.font = `${fsSmall}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    ctx.fillText('jak', cx, y);
    y += Math.round(fsSmall * 0.84);

    const fsBig = Math.round(sizePx * 0.062);
    ctx.font = `${fsBig}px ${F_HEAVY}`;
    const wBase = ctx.measureText('myślisz').width;
    const wQ    = ctx.measureText('?').width;
    const logoStartX = cx - (wBase + wQ) / 2;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'left';
    ctx.fillText('myślisz', logoStartX, y);
    ctx.fillStyle = RED;
    ctx.fillText('?', logoStartX + wBase, y);
    y += Math.round(fsBig * 1.32);

    // Kreska
    ctx.strokeStyle = DARK;
    ctx.lineWidth = Math.max(1, Math.round(sizePx * 0.004));
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(sizePx - pad, y); ctx.stroke();
    y += Math.round(sizePx * 0.038);

    // Pytanie (tytuł)
    const qLen = questionText.length;
    const fsQ  = Math.round(sizePx * (qLen > 40 ? 0.055 : qLen > 20 ? 0.068 : 0.085));
    ctx.font = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, questionText, sizePx - pad * 2);
    lines.forEach(line => { ctx.fillText(line, cx, y); y += Math.round(fsQ * 1.18); });

    // Kreska pod pytaniem
    y += Math.round(sizePx * 0.012);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(sizePx - pad, y); ctx.stroke();
    y += Math.round(sizePx * 0.032);

    // Opcje — skaluj gdy dużo
    const scale    = options.length >= 4 ? 0.82 : 1;
    const fsOpt    = Math.round(sizePx * 0.053 * scale);
    const optH     = Math.round(fsOpt * 1.9);
    const optGap   = Math.round(sizePx * 0.016 * scale);
    const fsCzy    = Math.round(sizePx * 0.046 * scale);

    ctx.lineWidth = Math.max(1, Math.round(sizePx * 0.003));

    options.forEach((opt, i) => {
        // "czy" przed ostatnią opcją
        if (i === options.length - 1 && options.length > 1) {
            ctx.font = `${fsCzy}px ${F_HEAVY}`;
            ctx.fillStyle = DARK;
            ctx.textAlign = 'left';
            ctx.fillText('czy', pad + padH * 0.3, y + optH * 0.05);
            y += Math.round(fsCzy * 1.25);
        }
        ctx.strokeStyle = DARK;
        ctx.strokeRect(pad, y, sizePx - pad * 2, optH);
        ctx.font = `${fsOpt}px ${F_HEAVY}`;
        ctx.fillStyle = DARK;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(opt.label, pad + padH, y + optH / 2);
        ctx.textBaseline = 'top';
        y += optH + optGap;
    });

    // URL
    y += Math.round(sizePx * 0.02);
    const fsURL = Math.round(sizePx * 0.027);
    ctx.font = `600 ${fsURL}px ${F_BODY}`;
    ctx.fillStyle = DARK;
    ctx.globalAlpha = 0.38;
    ctx.textAlign = 'center';
    ctx.fillText(`jakmyslisz.com/${questionId}`, cx, y);
    ctx.globalAlpha = 1;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
    return str.toLowerCase()
        .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e')
        .replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o')
        .replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const QRStickerModal = ({ questionId, questionText, onClose }) => {
    const [tab,       setTab]       = useState('qr');
    const [sizeMM,    setSizeMM]    = useState(80);
    const [dpi,       setDpi]       = useState(300);
    const [rendering, setRendering] = useState(false);
    const previewRef = useRef(null);

    const options = QUESTIONS_DATA[questionId]?.options ?? [];

    const renderPreview = useCallback(async () => {
        if (!previewRef.current) return;
        setRendering(true);
        try {
            if (tab === 'qr') {
                await renderQRSticker(previewRef.current, { questionText, questionId, sizePx: PREVIEW_PX });
            } else {
                await renderQuestionSticker(previewRef.current, { questionText, questionId, options, sizePx: PREVIEW_PX });
            }
        } finally {
            setRendering(false);
        }
    }, [tab, questionText, questionId, options]);

    useEffect(() => { renderPreview(); }, [renderPreview]);

    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleDownload = useCallback(async () => {
        const sizePx   = Math.round((sizeMM / 25.4) * dpi);
        const exp      = document.createElement('canvas');
        const suffix   = tab === 'qr' ? 'qr' : 'pytanie';
        if (tab === 'qr') {
            await renderQRSticker(exp, { questionText, questionId, sizePx });
        } else {
            await renderQuestionSticker(exp, { questionText, questionId, options, sizePx });
        }
        const a = document.createElement('a');
        a.download = `jakmyslisz-${slugify(questionText)}-${suffix}-${sizeMM}mm-${dpi}dpi.png`;
        a.href = exp.toDataURL('image/png');
        a.click();
    }, [tab, questionText, questionId, options, sizeMM, dpi]);

    const sizePx = Math.round((sizeMM / 25.4) * dpi);

    return (
        <div className='qr-overlay' onClick={onClose}>
            <div className='qr-modal' onClick={e => e.stopPropagation()}>

                <div className='qr-modal-header'>
                    <div>
                        <div className='qr-modal-label'>naklejki do druku</div>
                        <div className='qr-modal-question'>{questionText}</div>
                    </div>
                    <button type='button' className='qr-close-btn' onClick={onClose}>✕</button>
                </div>

                <div className='qr-tabs'>
                    <button type='button' className={`qr-tab${tab === 'qr' ? ' active' : ''}`} onClick={() => setTab('qr')}>
                        naklejka QR
                    </button>
                    <button type='button' className={`qr-tab${tab === 'pytanie' ? ' active' : ''}`} onClick={() => setTab('pytanie')}>
                        naklejka z pytaniem
                    </button>
                </div>

                <div className='qr-preview-wrap'>
                    <canvas
                        ref={previewRef}
                        width={PREVIEW_PX}
                        height={PREVIEW_PX}
                        className='qr-preview-canvas'
                        style={{ opacity: rendering ? 0.35 : 1 }}
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
