const express = require("express");
const router = express.Router();

const {
    getBookmarks,
    checkBookmark,
    createBookmark,
    deleteBookmark,
} = require("../controllers/bookmarkController");

const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

// All bookmark routes require authentication
router.use(protect);
router.use(apiLimiter);

router.get("/", getBookmarks);
router.get("/check/:algorithmId", checkBookmark);
router.post("/", createBookmark);
router.delete("/:algorithmId", deleteBookmark);

module.exports = router;
