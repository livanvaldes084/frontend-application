import ResourceService from '@/service/resource/resourceService';
import axios from 'axios';

export default class InvitationService extends ResourceService {
    getAll(config = {}) {
        return axios.get('invitations/list', config);
    }

    getItem() {
        return Promise.resolve().then(() => {
            return {
                data: {},
            };
        });
    }

    save(data, isNew = false) {
        return axios.post(`invitations/${isNew ? 'create' : 'edit'}`, data);
    }

    resend(id) {
        return axios.post('invitations/resend', { id });
    }

    deleteItem(id) {
        return axios.post('invitations/remove', { id });
    }

    getWithFilters(filters, config = {}) {
        return axios.post('invitations/list', filters, config);
    }
}
