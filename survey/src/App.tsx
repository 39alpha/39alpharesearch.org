import './App.scss';
import * as config from './config.json';
import Footer from './components/Footer';
import Header from './components/Header';
import Survey from './components/Survey';

export default function App() {
    return (
        <>
            <Header {...config} />
            <main className="page-content" aria-label="Content">
                <div className="wrapper wrapper--narrow">
                    <article className="post">
                        <div className="post-content">
                            <Survey
                                title="A title"
                                description="This is the survey. There are many like it, but this is yours."
                                questions={[]}
                            />
                        </div>
                    </article>
                </div>
            </main>
            <Footer {...config} />
        </>
    );
}
