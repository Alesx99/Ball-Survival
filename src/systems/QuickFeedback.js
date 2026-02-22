export class QuickFeedback {
    constructor() {
        this.feedbackData = [];
    }

    collectFeedback(rating, comment = '') {
        this.feedbackData.push({
            rating,
            comment,
            timestamp: Date.now()
        });
    }

    getFeedbackSummary() {
        if (this.feedbackData.length === 0) {
            return { count: 0, avgRating: 0, recent: [] };
        }
        const avgRating = this.feedbackData.reduce((sum, f) => sum + f.rating, 0) / this.feedbackData.length;
        const recent = this.feedbackData.slice(-5).reverse();
        return {
            count: this.feedbackData.length,
            avgRating,
            recent
        };
    }
}
