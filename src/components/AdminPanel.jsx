import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import useAdminStats from '../hooks/useAdminStats';
import { useData } from '../contexts/DataContext';
import AdminTabs from './admin/AdminTabs';
import OverviewTab from './admin/OverviewTab';
import LocationsTab from './admin/LocationsTab';
import QuestionsTab from './admin/QuestionsTab';
import ContentTab from './admin/ContentTab';
import './AdminPanel.scss';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN;

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        sessionStorage.getItem('admin_auth') === 'true'
    );
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState(false);

    const [answers, setAnswers] = useState([]);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab,     setActiveTab]     = useState('overview');
    const [contentFilter, setContentFilter] = useState(null);

    const { questions } = useData();
    const stats = useAdminStats(answers, scans, questions);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            setLoading(answers.length === 0 && scans.length === 0);

            const [answersSnap, scansSnap] = await Promise.all([
                getDocs(collection(db, "answers")),
                getDocs(collection(db, "scans")).catch(() => null),
            ]);

            const answersData = answersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const scansData = scansSnap ? scansSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];

            setAnswers(answersData);
            setScans(scansData);
            setError(null);
        } catch (err) {
            setError('Błąd połączenia: ' + err.message);
            console.error('Firebase error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchData();
    }, [isAuthenticated]);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput === ADMIN_PIN) {
            sessionStorage.setItem('admin_auth', 'true');
            setIsAuthenticated(true);
        } else {
            setPinError(true);
            setPinInput('');
            setTimeout(() => setPinError(false), 1500);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className='admin-login'>
                <div className='admin-login-box'>
                    <div className='admin-brand'>
                        <div className='admin-brand-stacked'>
                            <div className='admin-brand-line1'>jak</div>
                            <div className='admin-brand-line2'>myślisz<span className='brand-q'>?</span></div>
                        </div>
                        <span className='admin-label'>admin</span>
                    </div>
                    <form onSubmit={handlePinSubmit} className='pin-form'>
                        <input
                            type='password'
                            className={`pin-input${pinError ? ' error' : ''}`}
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value)}
                            placeholder='PIN'
                            autoFocus
                        />
                        <button type='submit' className='pin-btn'>Wejdź</button>
                    </form>
                    {pinError && <p className='pin-error'>Zły PIN</p>}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className='admin-dashboard'>
                <div className='loading-screen'>
                    <div className='loading-spinner' />
                    <p>Ładowanie danych...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='admin-dashboard'>
                <div className='error-screen'>
                    <p>{error}</p>
                    <button onClick={fetchData}>Spróbuj ponownie</button>
                </div>
            </div>
        );
    }

    return (
        <div className='admin-dashboard'>
            <div className='admin-topbar'>
                <header className='admin-header'>
                    <div className='admin-brand'>
                        <div className='admin-brand-stacked'>
                            <div className='admin-brand-line1'>jak</div>
                            <div className='admin-brand-line2'>myślisz<span className='brand-q'>?</span></div>
                        </div>
                        <span className='admin-label'>admin</span>
                    </div>
                    <button
                        onClick={fetchData}
                        className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
                        disabled={refreshing}
                    >
                        <FontAwesomeIcon icon={faRefresh} />
                        Odśwież
                    </button>
                </header>

                <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className='admin-content'>
                {activeTab === 'overview'   && <OverviewTab   stats={stats?.overview}  onGoToPrinted={() => { setActiveTab('content'); setContentFilter('printed'); }} />}
                {activeTab === 'locations'  && <LocationsTab  stats={stats?.locations}  />}
                {activeTab === 'questions'  && <QuestionsTab  stats={stats?.questions}  />}
                {activeTab === 'content'    && <ContentTab filterPrinted={contentFilter === 'printed'} onClearFilter={() => setContentFilter(null)} />}
            </div>
        </div>
    );
};

export default AdminPanel;
