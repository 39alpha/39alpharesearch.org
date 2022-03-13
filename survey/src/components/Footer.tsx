interface AuthorProps {
    name: string;
    email: string;
    address: Array<string>;
}

interface SocialMediaProps {
    url: string;
    service: string;
    username: string;
}

interface DonateProps {
    values: Array<Number>;
}

interface FooterProps {
    name: string;
    author: AuthorProps;
    ein: string;
    social: Array<SocialMediaProps>;
    donate: DonateProps;
}

export default function Footer(props: FooterProps) {
    return (
        <footer className="site-footer h-card">
            <div className="wrapper wrapper--wide">
                <div className="footer-col-wrapper">
                    <div className="footer-col footer-col-1">
                        <ContactList {...props} />
                    </div>
                    <div className="footer-col footer-col-2">
                        <SocialMedia {...props} />
                    </div>
                    <div className="footer-col footer-col-3">
                        <Donate {...props} />
                    </div>
                </div>
                <p className="site-footer__copyright">
                    &#169; 2019-2022 {props.name}.|All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}

function ContactList(props: FooterProps) {
    return (
        <>
        <ul className="contact-list">
            <li className="p-name">
                {props.author.name}
            </li>
            <li><a className="u-email" href={"mailto:" + props.author.email}>{props.author.email}</a></li>
            {props.author.address.map((line, index) => (<li key={index.toString()}>{line}</li>))}
        </ul>
        <div>A 501(c)(3) Organization<br /></div>
        <div>EIN: {props.ein}</div>
        </>
    );
}

function SocialMedia(props: FooterProps) {
    return (
        <ul className="social-media-list">
            {props.social.map(({url, service, username}, index) => {
                return (
                    <li>
                        <a href={url}>
                            <svg className="svg-icon">
                                <use xlinkHref={"/images/39alpha-social-icons.svg#" + service}></use>
                            </svg>
                            <span className="username">{username}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}

function Donate(props: FooterProps) {
    return (
        <div className="donations">
            <div className="donations__solicitation">
                <h1 className="donations__solicitation--header">Show your support with a donation</h1>
            </div>
            <div className="donations__options">
                {props.donate.values.map((value, index) => {
                    return (
                        <div className="donations__option" key={index.toString()}>
                            <a className="donations__option--link" href={"/donate?amount=" + value}>
                                <div className="donations__option--value">
                                    ${value}
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
