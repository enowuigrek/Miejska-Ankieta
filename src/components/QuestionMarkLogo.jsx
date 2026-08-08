import React from 'react';
import './QuestionMarkLogo.scss';

// Alternatywne logo — czerwony znak zapytania, ten sam co na naklejkach do druku
// (QRStickerModal.jsx -> drawQMarkContent). Trzymany w jednym miejscu, żeby zmiana
// designu (kształt, font, kolor) propagowała się wszędzie, gdzie logo jest używane.
const QuestionMarkLogo = ({ className = '' }) => (
    <span className={`question-mark-logo${className ? ` ${className}` : ''}`}>?</span>
);

export default QuestionMarkLogo;
