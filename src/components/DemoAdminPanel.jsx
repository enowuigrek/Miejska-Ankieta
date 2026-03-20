import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask } from '@fortawesome/free-solid-svg-icons';
import useAdminStats from '../hooks/useAdminStats';
import { useData }   from '../contexts/DataContext';
import AdminTabs     from './admin/AdminTabs';
import OverviewTab   from './admin/OverviewTab';
import LocationsTab  from './admin/LocationsTab';
import QuestionsTab  from './admin/QuestionsTab';
import ContentTab    from './admin/ContentTab';
import { DEMO_ANSWERS, DEMO_SCANS, DEMO_SOCIAL_CLICKS } from '../demo/mockData';
import './AdminPanel.scss';

const DemoAdminPanel = () => {
    const [activeTab,     setActiveTab]     = useState('overview');
    const [contentFilter, setContentFilter] = useState(null);

    const { questions } = useData();
    const stats = useAdminStats(DEMO_ANSWERS, DEMO_SCANS, questions, DEMO_SOCIAL_CLICKS);

    return (
        <div className='admin-dashboard'>

            {/* baner demo */}
            <div className='demo-banner'>
                <FontAwesomeIcon icon={faFlask} />
                &nbsp;tryb demo — dane są przykładowe, nic nie jest zapisywane
            </div>

            <div className='admin-topbar'>
                <header className='admin-header'>
                    <div className='admin-brand'>
                        <div className='admin-brand-stacked'>
                            <div className='admin-brand-line1'>jak</div>
                            <div className='admin-brand-line2'>myślisz<span className='brand-q'>?</span></div>
                            <div className='admin-label'>demo</div>
                        </div>
                    </div>
                    <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </header>
            </div>

            <div className='admin-content'>
                {activeTab === 'overview'  && (
                    <OverviewTab
                        stats={stats?.overview}
                        scans={DEMO_SCANS}
                        answers={DEMO_ANSWERS}
                        socialClicks={DEMO_SOCIAL_CLICKS}
                        onGoToPrinted={() => { setActiveTab('content'); setContentFilter('printed'); }}
                    />
                )}
                {activeTab === 'locations' && <LocationsTab stats={stats?.locations} />}
                {activeTab === 'questions' && <QuestionsTab stats={stats?.questions} />}
                {activeTab === 'content'   && (
                    <ContentTab
                        filterPrinted={contentFilter === 'printed'}
                        onClearFilter={() => setContentFilter(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default DemoAdminPanel;
