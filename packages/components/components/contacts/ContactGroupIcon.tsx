import Tooltip from '../tooltip/Tooltip';
import Icon from '../icon/Icon';

interface Props {
    name: string;
    color: string;
}

const ContactGroupIcon = ({ name, color, ...rest }: Props) => {
    return (
        <Tooltip title={name}>
            <Icon name="user-group" color={color} {...rest} />
        </Tooltip>
    );
};

export default ContactGroupIcon;
