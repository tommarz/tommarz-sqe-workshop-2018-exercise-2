import $ from 'jquery';
import {parseCode, ast_handler} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let records = ast_handler(parsedCode);
        let table = $('#table');
        table.empty();
        table.append(makeHTMLTable(records));
    });
});

function makeHTMLTable(myArray) {
    let result = '<table border=1>';
    let indexes = ['line', 'type', 'name', 'cond', 'val'];
    result += '<thead><tr><th>Line</th><th>Type</th><th>Name</th><th>Condition</th><th>Value</th></tr></thead>';
    for (let i = 0; i < myArray.length; i++) {
        result += '<tr>';
        for(let  j = 0; j<indexes.length; j++) {
            result += '<td>' + (myArray[i][indexes[j]] ? myArray[i][indexes[j]] : '') + '</td>';
        }
        result += '</tr>';
    }
    result += '</table>';
    return result;
}

