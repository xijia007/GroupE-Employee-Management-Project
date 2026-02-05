import api from './api';

export const generateRegistrationToken = async (email, name) => {
    try {
        const response = await api.post('/hr/generate-token', { email, name });

        return response.data;

    } catch (err) { 
        console.error('Generate token error:', err);
        throw err;
    }
}

export const getAllTokens = async () => {
    try {
        const response = await api.get('/hr/tokens');

        return response.data;

    } catch (err) {
        console.error('Get token error:', err);
        throw err;
    }
}

export const getAllApplications = async (status='All') => {
    try {
        const response = await api.get('/hr/applications', {
            params: { status }
        });

        return response.data;

    } catch (err) {
        console.error('Get applications error');
        throw err;
    }
};

export const getApplicationById = async (id) => {
    try {
        const response = await api.get(`/hr/applications/${id}`);
        return response.data;

    } catch (err) {
        console.error('Get application error');
        throw err;
    }
}

export const reviewApplication = async (id, status, feedback='') => {
    try {
        const response = await api.patch(`/hr/applications/${id}/review`, {
            status,
            feedback
        });

        return response.data;

    } catch (err) {
        console.error('Reviewed application error');
        throw err;
    }
}

export default {
    generateRegistrationToken,
    getAllTokens,
    getAllApplications,
    getApplicationById,
    reviewApplication
};
