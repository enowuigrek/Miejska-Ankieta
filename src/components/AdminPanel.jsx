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
import NotificationBell from './admin/NotificationBell';
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
    const [socialClicks, setSocialClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab,     setActiveTab]     = useState('overview');
    const [contentFilter, setContentFilter] = useState(null);

    const { questions } = useData();
    const stats = useAdminStats(answers, scans, questions, socialClicks);

    // Dynamic admin favicon (dark bg + red ?) for iPhone home screen shortcut
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        // Dark background
        ctx.fillStyle = 'rgb(69, 69, 69)';
        ctx.fillRect(0, 0, 180, 180);
        // Red question mark
        ctx.fillStyle = '#FF2323';
        ctx.font = '900 140px "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 90, 98);

        const dataUrl = canvas.toDataURL('image/png');

        const link = document.querySelector("link[rel~='icon']");
        const apple = document.querySelector("link[rel='apple-touch-icon']");
        const origFavicon = link?.href;
        const origApple = apple?.href;

        if (link) link.href = dataUrl;
        if (apple) apple.href = dataUrl;

        // Set title
        const origTitle = document.title;
        document.title = 'jakmyślisz — admin';

        // PWA meta for iPhone
        let metaCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (!metaCapable) {
            metaCapable = document.createElement('meta');
            metaCapable.name = 'apple-mobile-web-app-capable';
            metaCapable.content = 'yes';
            document.head.appendChild(metaCapable);
        }
        let metaTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (!metaTitle) {
            metaTitle = document.createElement('meta');
            metaTitle.name = 'apple-mobile-web-app-title';
            metaTitle.content = 'jakmyślisz admin';
            document.head.appendChild(metaTitle);
        }

        return () => {
            if (link && origFavicon) link.href = origFavicon;
            if (apple && origApple) apple.href = origApple;
            document.title = origTitle;
        };
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            setLoading(answers.length === 0 && scans.length === 0);

            const [answersSnap, scansSnap, socialSnap] = await Promise.all([
                getDocs(collection(db, "answers")),
                getDocs(collection(db, "scans")).catch(() => null),
                getDocs(collection(db, "socialClicks")).catch(() => null),
            ]);

            const answersData = answersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const scansData = scansSnap ? scansSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
            const socialData = socialSnap ? socialSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];

            setAnswers(answersData);
            setScans(scansData);
            setSocialClicks(socialData);
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
                            <div className='admin-label'>admin</div>
                        </div>
                    </div>
                    <form onSubmit={handlePinSubmit} className='pin-form'>
                        <input
                            type='password'
                            inputMode='numeric'
                            pattern='[0-9]*'
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
                            <div className='admin-label'>admin</div>
                        </div>
                    </div>
                    <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    <NotificationBell />
                    <button
                        onClick={fetchData}
                        className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
                        disabled={refreshing}
                    >
                        <FontAwesomeIcon icon={faRefresh} />
                        Odśwież
                    </button>
                </header>
            </div>

            <div className='admin-content'>
                {activeTab === 'overview'   && <OverviewTab   stats={stats?.overview} scans={scans} answers={answers} socialClicks={socialClicks} onGoToPrinted={() => { setActiveTab('content'); setContentFilter('printed'); }} />}
                {activeTab === 'locations'  && <LocationsTab  stats={stats?.locations}  />}
                {activeTab === 'questions'  && <QuestionsTab  stats={stats?.questions}  />}
                {activeTab === 'content'    && <ContentTab filterPrinted={contentFilter === 'printed'} onClearFilter={() => setContentFilter(null)} />}
            </div>
        </div>
    );
};

export default AdminPanel;
