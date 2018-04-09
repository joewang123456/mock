/**
 * 申诉页，根据申诉状态，控制不同的显示
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import axios from 'axios';
import './api';//注入mock文件

class MyCreditScore extends Component {

    componentDidMount() {
        //测试fetch
        fetch('/api/getAllUsers?pageNo=4&pageSize=10', {
            method: 'get'
        }).then((res) => {
            return res.json();
        }).then((data) => {
            console.log(data);
        });
        //测试ajax
        $.ajax({
            type: 'GET',
            url: '/api/getAllUsers',
            data: 'pageNo=4&pageSize=10',
            dataType: 'json',
            success: function (data) {
                console.log(data);
            }
        });
        //测试axios
        axios.get('/api/getAllUsers', {
            method: 'get',
            params: {
                pageNo: 1,
                pageSize: 10
            }
        })
            .then(function (res) {
                console.log(res.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        return (
            <div>
                {'hello'}
            </div>
        )
    }
}

ReactDOM.render(
    <MyCreditScore />, document.getElementById('root')
);