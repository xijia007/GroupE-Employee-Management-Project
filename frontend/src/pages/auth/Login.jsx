import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Form, 
    Input, 
    Button, 
    Card, 
    message, 
    Typography, 
    Alert 
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { selectAuthError, selectAuthLoading, selectUser } from '../../features/auth/authSlice';

const { Title, Text } = Typography;

const Login = () => {
    // Hooks 
    const dispatch = useDispatch(); // dispatch: Call Redux actions

    const navigate = useNavigate(); // Navigate to different pages

    // Get state from Redux store 
    const user = useSelector(selectUser);
    
    const loading = useSelector(selectAuthLoading);

    const error = useSelector(selectAuthError);

     // useEffect: Navigate after successful login
    useEffect(() => {
        if (user) {
            message.success(`Welcome back, ${user.username}!`);

            if (user.role === 'HR') {
                navigate('/hr/hiring-management');
            } else {
                if (user.onboardingStatus === 'Approved') {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        }
    })

}




