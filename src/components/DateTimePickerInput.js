import React from 'react';
import TextField from '@mui/material/TextField';

class DateTimePickerInput extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                { this.props.searchDateTimeValue ? 
                    (<div id={"searchBar"}><TextField {...this.props.textFieldProps} /> <span id={"resetSearch"} onClick={this.props.reset}><i className="fa fa-times-circle"/></span></div>) :
                    (<div onClick={this.props.textFieldProps.inputProps.onClick}><i style={{padding: '15px', fontSize:  '25px'}} className="fa fa-clock"/></div>)
                }
            </div>
        )
    }
}

export default DateTimePickerInput;