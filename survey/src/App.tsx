import './App.scss';
import * as config from './config.json';
import { ChangeEvent, Component, FormEvent, useState } from 'react';
import Survey from './components/Survey';
import Footer from './components/Footer';
import Header from './components/Header';
import {
    BrowserRouter as Router,
    Navigate,
    Routes,
    Route,
    useNavigate,
    useParams,
} from 'react-router-dom';

export default class App extends Component {
    render() {
        return (
            <>
                <Router>
                    <Header {...config} />
                    <main className="page-content" aria-label="Content">
                        <div className="wrapper wrapper--narrow">
                            <article className="post">
                                <div className="post-content">
                                    <Routes>
                                        <Route path="/surveys" element={<Home  />} />
                                        <Route
                                            path="/surveys/:surveyId"
                                            element={<TheSurvey />}
                                        />
                                        <Route
                                            path="/surveys/:surveyId/*"
                                            element={<RedirectToSurvey />}
                                        />
                                    </Routes>
                                </div>
                            </article>
                        </div>
                    </main>
                    <Footer {...config} />
                </Router>
            </>
        );
    }
}

function Home() {
    const [surveyId, setSurveyId] = useState('');
    const navigate = useNavigate();

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        navigate(`/surveys/${surveyId}`);
    }

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        setSurveyId(e.target.value);
    }


    return (
        <>
            <h2>39Alpha Surveys</h2>
            <p>
                39Alpha Research hosts a number of research surveys. If you are interested in
                participating in one, please <a href="/contact-us">contact us</a> and we will send
                you a link or survey identifier to one that suits your interest and our needs.
            </p>

            <h3>Survey Search</h3>
            <p>If you know the survey's identifier, you can enter it below to load the survey.</p>
            <form className="search" onSubmit={submit}>
                <input type="text" className="search__text" onChange={onChange} required/>
                <input type="submit" className="search__button" value="Go" />
            </form>
        </>
    );
}

function TheSurvey() {
    const { surveyId } = useParams();
    return (<Survey id={surveyId} />);
}

function RedirectToSurvey() {
    const { surveyId } = useParams();
    return (<Navigate to={`/surveys/${surveyId}`} />);
}
