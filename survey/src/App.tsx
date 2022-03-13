import './App.scss';
import * as config from './config.json';
import Footer from './components/Footer';
import Header from './components/Header';

export default function App() {
    return (
        <>
            <Header {...config} />
            <main className="page-content" aria-label="Content">
                <div className="wrapper wrapper--narrow">
                    <article className="post">
                        <div className="post-content">
                            <p>Edit <code>src/App.tsx</code> and save to reload.</p>
                            <a
                                className="App-link"
                                href="https://reactjs.org"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn React
                            </a>
                        </div>
                    </article>
                </div>
            </main>
            <Footer {...config} />
        </>
    );
}
