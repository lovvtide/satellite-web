import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { COLORS } from '../../constants';


class UploadedMedia extends PureComponent {

	state = {};

	componentWillUnmount = () => {

		if (this.props.objectUrl) {

			URL.revokeObjectURL(this.props.objectUrl);
		}
	};

	renderComplete = () => {

		const { type, objectUrl } = this.props;

		if (!objectUrl) { return null; }

		const mediaType = type.split('/')[0];

		let element = null;

		if (mediaType === 'image') {

			element = (
				<img
					src={objectUrl}
					style={{
						width: '100%',
						height: 'auto'
					}}
				/>
			);

		} else if (mediaType === 'video') {

			element = (
				<video
					controls
					src={objectUrl}
					style={{
						width: '100%',
						height: 'auto'
					}}
				/>
			);

		} else if (mediaType === 'audio') {

			element = (
				<audio
					controls
					src={objectUrl}
					style={{
						width: '100%',
						height: 'auto'
					}}
				/>
			);
		}

		return element ? (
			<div style={{ marginBottom: 8 }}>
				{element}
			</div>
		) : null;
	};

	render = () => {

		const { name, event, loaded, size, complete } = this.props;

		if (!event) { return null; }

		return (
			<div>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'JetBrains-Mono-Regular',
					fontSize: 12,
					color: COLORS.secondaryBright,
					marginBottom: 4
				}}>
					<span>{name}</span>
					{complete ? (
						<Icon
							name='check circle outline'
							style={{ color: COLORS.secondaryBright, height: 19, marginRight: 0, marginLeft: 5 }}
						/>
					) : (
						<span style={{ color: COLORS.secondaryBright, marginLeft: 5 }}>
							{Math.floor((loaded / size) * 100)}%
						</span>
					)}
				</div>
				{this.renderComplete()}
			</div>
		);
	};
}

export default UploadedMedia;
