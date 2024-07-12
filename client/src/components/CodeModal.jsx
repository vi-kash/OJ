/* eslint-disable react/prop-types */
import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

const StyledModalBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: 24,
    padding: theme.spacing(4),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.grey[500],
}));

const StyledCode = styled('pre')(() => ({
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
}));

const CodeModal = ({ open, handleClose, code, result }) => {
    React.useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    return (
        <Modal open={open} onClose={handleClose}>
            <StyledModalBox>
                <StyledCloseButton onClick={handleClose}>
                    <CloseIcon />
                </StyledCloseButton>
                <Typography variant="h6" component="h2">
                    {result}
                </Typography>
                <StyledCode className="language-javascript">
                    <code>{code}</code>
                </StyledCode>
            </StyledModalBox>
        </Modal>
    );
};

export default CodeModal;
