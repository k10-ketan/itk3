'use strict';
const express = require('express');
const router = express.Router();
const tasksController = require('../tasks/tasks.controller');
const { authenticate } = require('../../middleware/auth.middleware');

/**
 * @openapi
 * /api/documents/{docId}/download:
 *   get:
 *     summary: Download a document by ID
 *     tags: [Documents]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema: { type: string }
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:docId/download', authenticate, tasksController.downloadDocument);

/**
 * @openapi
 * /api/documents/{docId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema: { type: string }
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:docId', authenticate, tasksController.deleteDocument);

module.exports = router;
