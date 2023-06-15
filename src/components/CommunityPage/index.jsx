import React, { PureComponent } from 'react';


class CommunityPage extends PureComponent {

	state = {};

	render = () => {

		return (
			<div>
				Community Page {this.props.match.params.name}
			</div>
		);
	};

}

export default CommunityPage;
