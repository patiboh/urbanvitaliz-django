import Alpine from 'alpinejs'
import { resourcePreviewUrl } from '../utils/api'
import { renderMarkdown } from '../utils/markdown'
import { formatDate } from '../utils/date';
import { gravatar_url } from '../utils/gravatar'
import { isStatusUpdate, statusText } from "../utils/taskStatus"
import { truncate } from '../utils/taskStatus'

export default function PreviewModal() {
    return {
        pendingComment: '',
        currentlyEditing: null,
        followupsIsLoading: false,
        contentIsLoading: false,
        get index() {
            return this.$store.previewModal.index
        },
        get taskId() {
            return this.$store.previewModal.taskId
        },
        get task() {
            return this.$store.tasksData.getTaskById(this.taskId)
        },
        get followups() {
            return this.$store.previewModal.followups
        },
        get notifications() {
            return this.$store.previewModal.notifications
        },
        get newTasks() {
            return this.$store.tasksData.newTasks
        },
        async refresh() {
            this.followupScrollToLastMessage();
        },
        resourcePreviewUrl,
        renderMarkdown,
        formatDate,
        gravatar_url,
        isStatusUpdate,
        statusText,
        truncate,
        newTasksNavigationText() {
            return `${this.index + 1} sur ${this.newTasks.length} recommandation${this.newTasks.length > 0 ? 's' : ''}`
        },
        hasNotification(followupId) {
            return this.notifications.filter(n => n.action_object.who && n.action_object.id === followupId).length > 0;
        },
        async onSubmitComment(content) {
            this.$store.editor.setIsSubmitted(true);
            if (!this.currentlyEditing) {
                await this.$store.tasksData.issueFollowup(this.task, undefined, content);
                await this.$store.previewModal.loadFollowups();
            } else {
                const [type, id] = this.currentlyEditing;
                if (type === "followup") {
                    await this.$store.tasksData.editComment(this.task.id, id, content);
                    await this.$store.previewModal.loadFollowups();
                } else if (type === "content") {
                    await this.$store.tasksData.patchTask(this.task.id, { content: content });
                    await this.$store.tasksView.updateViewWithTask(this.task.id)
                }
            }

            this.pendingComment = "";
            this.currentlyEditing = null;
            this.$dispatch('set-comment', this.pendingComment)
            this.followupScrollToLastMessage();
        },
        onEditComment(followup) {
            this.pendingComment = followup.comment;
            this.currentlyEditing = ["followup", followup.id];
            document.querySelector('#comment-text-ref .ProseMirror').focus();
            this.$dispatch('set-comment', followup.comment)
        },
        onEditContent() {
            this.pendingComment = this.task.content;
            this.currentlyEditing = ["content", this.task.id];
            document.querySelector('#comment-text-ref .ProseMirror').focus();
            this.$dispatch('set-comment', this.task.content)
        },
        loadContent() {
            this.contentIsLoading = true
            setTimeout(() => {
                this.contentIsLoading = false
            }, 300)
        },
        followupScrollToLastMessage(initPage = false) {

            if (initPage) {
                this.followupsIsLoading = true
            }

            const scrollContainer = document.getElementById("followups-scroll-container");
            if (scrollContainer) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;

                    if (initPage) {
                        this.followupsIsLoading = false
                    }

                }, initPage ? 500 : 1)
            }
        },
        getTypeOfModalClass(isDocumented) {
            let typeOfModalClass = '';

            if (this.$store.previewModal.isPaginated) {
                typeOfModalClass = 'is-paginated'
            }

            if (isDocumented) {
                typeOfModalClass = 'is-documented'
            }

            if (this.$store.previewModal.isPaginated && isDocumented) {
                typeOfModalClass = 'is-paginated-documented'
            }

            return typeOfModalClass
        }
    }
}

Alpine.data("PreviewModal", PreviewModal)
