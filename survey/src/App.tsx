import './App.scss';
import * as config from './config.json';
import * as survey from './survey.json';
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
                            <Survey {...survey} />
                        </div>
                    </article>
                </div>
            </main>
            <Footer {...config} />
        </>
    );
}
