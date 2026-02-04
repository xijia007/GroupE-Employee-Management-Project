import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Card, 
    Form, 
    Input, 
    Button, 
    Table, 
    message, 
    Tag, 
    Space,
    Typography,
    Divider 
} from 'antd';
import { generateRegistrationToken, getAllTokens, getAllApplications } from '../../services/hrService';

