import {useCurrentUser} from '../hooks/useCurrentUser';
import styles from '../styles/Dashboard.module.css';
import App from '../components/App';

function Dashboard() {
    const {isLoading, isAuthorized, username} = useCurrentUser();

    if (isLoading) {
        return null;
    }
    const authorizedBody = 
    <>
        You successfully signed in with Passage.
        <br/><br/>
        Your username is: <b>{username}</b>
        <App/>
    </>

    const unauthorizedBody = 
    <>
        You have not logged in and cannot view the dashboard.
        <br/><br/>
        <a href="/" className={styles.link}>Login to continue.</a>
    </>

    return (
        <div className={styles.dashboard}>
            <div className={styles.title}>{isAuthorized ? 'Welcome!' : 'Unauthorized'}</div>
            <div className={styles.message}>
                { isAuthorized ? authorizedBody : unauthorizedBody }
            </div>
        </div>
    );

}

export default Dashboard;