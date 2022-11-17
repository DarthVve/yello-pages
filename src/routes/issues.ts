import { Router } from 'express';
import { openIssue, updateIssue, getIssues, getIssue } from '../controller/issueController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, getIssues)
router.get('/:id', auth, getIssue)
router.post('/', auth, openIssue)
router.patch('/:id', auth, updateIssue)