import api from '../services/api';

export default {
    fetchAll() {
        return api().get('all')
    }
}
