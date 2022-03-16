import './App.scss';
import * as config from './config.json';
import { Component } from 'react';
import Survey from './components/Survey';
import Footer from './components/Footer';
import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';

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
                                        <Route path="/survey" element={<Home  />} />
                                        <Route
                                            path="/survey/:surveyId/*"
                                            element={<TheSurvey />}
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
    return (
        <>
            <h2>39Alpha Surveys</h2>
            <p>
                39Alpha Research hosts a number of research surveys. If you are interested in
                participating in one, please <a href="/contact-us">contact us</a> and we will send
                you a link to one that suits your interest and our needs.
            </p>
        </>
    );
}

function TheSurvey() {
    const { surveyId } = useParams();
    return (<Survey id={surveyId} />);
}
