import React from 'react';
import get from 'lodash/get';
import {
 Card, Input, Form, Button, Icon, Table, message, Skeleton, notification,
} from 'antd';
import { connect } from 'react-redux';

import { css } from 'emotion';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { getAppPermissionsByName, getAppPlanByName } from '../../batteries/modules/selectors';

import { getPermission, getPublicKey, updatePublicKey } from '../../batteries/modules/actions';
import { setRole } from '../../utils';

const { Column } = Table;

const formLabelStyle = css`
	label {
		font-weight: 600;
		color: #595959;
	}
`;

const labelMargin = {
	marginBottom: 5,
};
const bannerMessagesCred = {
	free: {
		title: 'Role Base Access',
		description:
			'Upgrade now to set granular ACLs, restrict by Referers and IP Sources, and more.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Role Base Access',
		description: 'See how to effectively use security credentials to secure your app.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/concepts/api-credentials.html',
	},
	growth: {
		title: 'Role Base Access',
		description: 'See how to effectively use security credentials to secure your app.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/concepts/api-credentials.html',
	},
};

class RoleBaseAccess extends React.Component {
	constructor() {
		super();
		this.state = {
			publicKey: '',
			roleKey: '',
			loadingKey: {},
		};
	}

	componentDidMount() {
		const {
 			isPaidUser, fetchPublicKey, appName, fetchPermissions,
		} = this.props; // prettier-ignore
		if (isPaidUser) {
			fetchPublicKey(appName);
			fetchPermissions(appName);
		}
	}

	componentDidUpdate(prevProps) {
		const {
			publicKey,
			roleKey,
			updatedKey,
			fetchPublicKey,
			appName,
			isPublicKeyLoading,
			updateKeyError,
			publicKeyError,
		} = this.props;

		const {
			publicKey: prevPublicKey,
			roleKey: prevRoleKey,
			updateKeyError: prevUpdateError,
			publicKeyError: prevKeyError,
		} = prevProps;

		if (publicKey !== prevPublicKey || roleKey !== prevRoleKey) {
			this.handleKeyes({
				publicKey,
				roleKey,
			});
		}

		if (
			updatedKey
			&& !isPublicKeyLoading
			&& (updatedKey.public_key !== publicKey || updatedKey.role_key !== roleKey)
		) {
			notification.success({
				message: updatedKey.message,
			});
			fetchPublicKey(appName);
		}

		if (updateKeyError && prevUpdateError !== updateKeyError) {
			notification.error({
				message: updateKeyError,
			});
		}
		if (publicKeyError && prevKeyError !== publicKeyError) {
			notification.error({
				message: publicKeyError,
			});
		}
	}

	handleKeyes = ({ publicKey, roleKey }) => {
		this.setState({
			publicKey,
			roleKey,
		});
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleRole = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	setLoading = (id) => {
		this.setState(prevState => ({
			loadingKey: {
				...prevState.loadingKey,
				[id]: prevState.loadingKey[id] ? !prevState.loadingKey[id] : true,
			},
		}));
	};

	saveRole = async (value) => {
		try {
			this.setLoading(value.username);
			const { appName, fetchPermissions } = this.props;
			const role = this.state && this.state[value.username];
			const response = await setRole(appName, value.username, role);
			if (response.status >= 400) {
				notification.error({ message: response.message });
			}
			notification.success({ message: response.message });
			fetchPermissions(appName);
			this.setLoading(value.username);
		} catch (e) {
			this.setLoading(value.username);
			notification.error({ message: e.message });
		}
	};

	handleSave = () => {
		const { publicKey, roleKey } = this.state;
		const { setKeyes, appName } = this.props;

		if (publicKey && roleKey) {
			setKeyes(appName, publicKey, roleKey);
		} else {
			notification.error({
				message: 'Please enter Public Key and Role',
			});
		}
	};

	render() {
		const {
			plan,
			isPaidUser,
			permissions,
			isPermissionsLoading,
			isPublicKeyLoading,
			publicKey: currentPublicKey,
			roleKey: currentRoleKey,
			updatingKeyes,
		} = this.props;
		const { roleKey, publicKey, loadingKey } = this.state;
		return (
			<React.Fragment>
				<Banner {...bannerMessagesCred[plan]} />
				{isPaidUser ? (
					<Container>
						<Card title="JWT Public Key">
							<p>
								The public key is used for verifying the JWT tokens for this app.
								Read more.
							</p>
							{isPublicKeyLoading ? (
								<Skeleton />
							) : (
								<Form layout="vertical" className={formLabelStyle}>
									<Form.Item label="Public Key" style={labelMargin}>
										<Input.TextArea
											name="publicKey"
											rows={3}
											value={publicKey}
											placeholder="Enter Public Key"
											onChange={this.handleChange}
										/>
									</Form.Item>
									<Form.Item label="Define Role" style={labelMargin}>
										<Input
											placeholder="Enter Role"
											value={roleKey}
											onChange={this.handleChange}
											name="roleKey"
										/>
									</Form.Item>
									<Form.Item style={labelMargin}>
										<Button
											disabled={
												currentRoleKey === roleKey
												&& currentPublicKey === publicKey
											}
											type="primary"
											onClick={this.handleSave}
										>
											<Icon type={updatingKeyes ? 'loading' : 'save'} />
											Submit
										</Button>
									</Form.Item>
								</Form>
							)}
						</Card>
						<Card title="Map Roles to API Credentials." style={{ marginTop: 20 }}>
							<p>
								You can map your existing API Credentials to any role name. This
								role name should be present in your Roles Key field of the JWT
								token. Read more.
							</p>
							{isPermissionsLoading ? (
								<Skeleton />
							) : (
								<Table dataSource={permissions}>
									<Column
										title="Credentials"
										key="credentials"
										render={value => `${value.username}:${value.password}`}
									/>
									<Column
										title="Description"
										key="description"
										render={value => (value && value.description) || 'No Description'
										}
									/>
									<Column
										title="Role"
										key="role"
										render={value => (
											<Input
												defaultValue={value && value.role}
												name={value.username}
												onChange={this.handleRole}
												placeholder="Define Role"
											/>
										)}
									/>

									<Column
										title="Action"
										key="action"
										render={value => (
											<Button
												shape="circle"
												disabled={
													!this.state[`${value.username}`]
													|| (this.state[`${value.username}`] || '')
														=== value.role
												}
												loading={loadingKey && loadingKey[value.username]}
												onClick={() => this.saveRole(value)}
												icon="save"
												type="primary"
											/>
										)}
									/>
								</Table>
							)}
						</Card>
					</Container>
				) : (
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="/static/images/analytics/Analytics.png"
						alt="analytics"
					/>
				)}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const planState = getAppPlanByName(state);
	const appPermissions = getAppPermissionsByName(state);

	return {
		appName: get(state, '$getCurrentApp.name'),
		plan: get(planState, 'plan'),
		isPaidUser: get(planState, 'isPaid'),
		permissions: get(appPermissions, 'results', []),
		isPermissionsLoading: get(state, '$getAppPermissions.isFetching'),
		isPublicKeyLoading: get(state, '$getAppPublicKey.isFetching'),
		publicKey: get(state, '$getAppPublicKey.results.public_key', ''),
		publicKeyError: get(state, '$getAppPublicKey.error.message', ''),
		updateKeyError: get(state, '$updateAppPublicKey.error.message', ''),
		updatedKey: get(state, '$updateAppPublicKey.results', ''),
		updatingKeyes: get(state, '$updateAppPublicKey.isFetching'),
		roleKey: get(state, '$getAppPublicKey.results.role_key', ''),
	};
};
const mapDispatchToProps = dispatch => ({
	fetchPermissions: appName => dispatch(getPermission(appName)),
	fetchPublicKey: appName => dispatch(getPublicKey(appName)),
	setKeyes: (appName, publicKey, roleKey) => dispatch(updatePublicKey(appName, publicKey, roleKey)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(RoleBaseAccess);
