import { makeAutoObservable } from 'mobx';

class UserStore {
    private open = false;
    private message = '';
    private type: 'success' | 'danger' = 'success';

    private timeout: number | null = null;

    constructor() {
        makeAutoObservable(this);
    }
    setOpen = (open: boolean) => {
        this.open = open;
    };
    setMessage = (message: string) => {
        this.message = message;
    };
    setType = (type: 'success' | 'danger') => {
        this.type = type;
    };
    setNotification = (
        open: boolean,
        message: string,
        type: 'success' | 'danger',
    ) => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.setOpen(open);
        this.setMessage(message);
        this.setType(type);

        this.timeout = setTimeout(() => {
            this.setOpen(false);
            this.setMessage('');
            this.setType('success');
            this.timeout = null;
        }, 3000);
    };
    getNotification = () => {
        return {
            open: this.open,
            message: this.message,
            type: this.type,
        };
    };
}

export default UserStore;
