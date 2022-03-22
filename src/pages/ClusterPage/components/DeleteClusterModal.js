import React from 'react';
import DeleteFeedbackForm from '../../ProfilePage/DeleteFeedbackForm';
import { Modal, Input } from 'antd';
import './styles.css';
class DeleteClusterModal extends React.Component {
	state = {
		deleteClusterName: '',
		isFeedbackSubmitted: false,
	};

	handleDelete = () => {
		const {
			// prettier-ignore
			clusterId,
			onDelete,
			handleModal,
		} = this.props;

		onDelete(clusterId);
		handleModal();
	};

	handleInputChange = e => {
		const { name, value } = e.target;
		this.setState({
			[name]: value,
		});
	};

	render() {
		const {
			isVisible, clusterId, clusterName, handleModal
		} = this.props; // prettier-ignore
		const { deleteClusterName, isFeedbackSubmitted } = this.state;

		let disabled = true;
		if (deleteClusterName === clusterName && isFeedbackSubmitted) {
			disabled = false;
		}

		return (
			<Modal
				visible={isVisible}
				onOk={this.handleDelete}
				onCancel={handleModal}
				destroyOnClose
				title="Confirm Delete"
				okText="Delete"
				okButtonProps={{ type: 'danger', disabled }}
				bodyStyle={{
					height: isFeedbackSubmitted ? 200 : 500,
					overflow: 'scroll',
				}}
			>
				<p>
					Type the cluster name{' '}
					<span style={{ fontWeight: '600' }}>{clusterName}</span>{' '}
					below to delete this cluster. This action cannot be undone.
				</p>
				<Input
					placeholder="Confirm cluster name"
					onChange={this.handleInputChange}
					value={deleteClusterName}
					name="deleteClusterName"
				/>
				{!isFeedbackSubmitted ? (
					<DeleteFeedbackForm
						setIsFeedbackSubmitted={() =>
							this.setState({
								isFeedbackSubmitted: true,
							})
						}
					/>
				) : (
					<h3 className="success-message-container">
						Thanks for filling this form!
					</h3>
				)}
			</Modal>
		);
	}
}

export default DeleteClusterModal;
