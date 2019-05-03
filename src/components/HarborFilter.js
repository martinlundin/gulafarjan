import React from 'react';

class HarborFilter extends React.Component {
    render() {
        return (
            <div className={`HarborFilter`}>
                {this.props.Harbors.map((Harbor) => (
                    <span key={Harbor.Id} onClick={this.props.changeHarbor.bind(this, Harbor.Name)}>
                        {Harbor.Name}
                    </span>
                ))}
            </div>
        )
    }
}

export default HarborFilter;
