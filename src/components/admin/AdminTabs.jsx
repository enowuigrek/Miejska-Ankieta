import React, { useRef, useState, useEffect } from 'react';
import './AdminTabs.scss';

const TABS = [
    { id: 'overview',   label: 'Przegląd'    },
    { id: 'locations',  label: 'Lokalizacje'  },
    { id: 'questions',  label: 'Pytania'      },
    { id: 'content',    label: 'Treści',  extra: 'admin-tab--content' },
];

const AdminTabs = ({ activeTab, onTabChange }) => {
    const navRef = useRef(null);
    const tabRefs = useRef({});
    const [indicator, setIndicator] = useState(null);

    useEffect(() => {
        const el = tabRefs.current[activeTab];
        const nav = navRef.current;
        if (!el || !nav) return;
        const navRect = nav.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setIndicator({
            left: elRect.left - navRect.left,
            width: elRect.width,
        });
    }, [activeTab]);

    return (
        <nav className='admin-tabs' ref={navRef}>
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    ref={el => { tabRefs.current[tab.id] = el; }}
                    className={`admin-tab${tab.extra ? ` ${tab.extra}` : ''}${activeTab === tab.id ? ' active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                    type='button'
                >
                    {tab.label}
                </button>
            ))}
            {indicator && (
                <div
                    className='admin-tab-indicator'
                    style={{ left: indicator.left, width: indicator.width }}
                />
            )}
        </nav>
    );
};

export default AdminTabs;
