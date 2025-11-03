const express = require('express');
const router = express.Router();
const VacationRequestsController = require('../controllers/vacationRequestsController');
const {
    createVacationRequestValidation,
    approveRejectRequestValidation,
    idParamValidation,
    userIdParamValidation
} = require('../middleware/validation');

// GET /api/vacation-requests - Get all vacation requests (for validators)
router.get('/', VacationRequestsController.getAllRequests);

// GET /api/vacation-requests/user/:userId - Get requests by user ID (for requesters)
router.get('/user/:userId', userIdParamValidation, VacationRequestsController.getRequestsByUserId);

// GET /api/vacation-requests/:id - Get vacation request by ID
router.get('/:id', idParamValidation, VacationRequestsController.getRequestById);

// POST /api/vacation-requests - Create a new vacation request
router.post('/', createVacationRequestValidation, VacationRequestsController.createRequest);

// PUT /api/vacation-requests/:id/approve - Approve a vacation request
router.put('/:id/approve',
    [...idParamValidation, ...approveRejectRequestValidation],
    VacationRequestsController.approveRequest
);

// PUT /api/vacation-requests/:id/reject - Reject a vacation request
router.put('/:id/reject',
    [...idParamValidation, ...approveRejectRequestValidation],
    VacationRequestsController.rejectRequest
);

// DELETE /api/vacation-requests/:id - Delete a vacation request
router.delete('/:id', idParamValidation, VacationRequestsController.deleteRequest);

module.exports = router;