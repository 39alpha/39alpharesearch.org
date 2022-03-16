export interface NavigationItemProps {
    url: string;
    title: string;
    children?: Array<NavigationItemProps>;
}

export interface NavigationProps {
    items: Array<NavigationItemProps>;
}

export function NavigationItem(props: NavigationItemProps) {
    if (props.children === undefined || props.children.length === 0) {
        return (
            <li>
                <a className="page-link" href={props.url}>{props.title}</a>
            </li>
        );
    }

    return (
        <li>
            <a className="page-link" href={props.url}>{props.title}</a>
            <ul className="sub-menu">
                {props.children.map((child, index) => {
                    return (<NavigationItem key={index.toString()} {...child} />);
                })}
            </ul>
        </li>
    );
}

export default function Navigation(props: NavigationProps) {
    if (props.items.length === 0) {
        return (<ul></ul>);
    }
    return (
        <ul>
            {props.items.map((item, index) => {
                return (<NavigationItem key={index.toString()} {...item} />);
            })}
        </ul>
    );
}
