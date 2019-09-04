import React from 'react';

class DeviationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "Deviation":   this.props.Deviation,
        };
    }

    render() {
        return (
            <div className={`Deviation`}>
                <span>{this.state.Deviation.Message}</span>
            </div>
        )
    }
}

export default DeviationComponent;