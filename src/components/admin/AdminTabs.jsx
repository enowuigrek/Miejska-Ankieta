import React from 'react';
import './AdminTabs.scss';

const TABS = [
    { id: 'overview',   label: 'Przegląd'    },
    { id: 'locations',  label: 'Lokalizacje'  },
    { id: 'questions',  label: 'Pytania'      },
    { id: 'content',    label: 'Treści'       },
];

const AdminTabs = ({ activeTab, onTabChange }) => {
    return (
        <nav className='admin-tabs'>
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    className={`admin-tab${activeTab === tab.id ? ' active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                    type='button'
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

export default AdminTabs;
