import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitute_program_expr} from './symbolic-substitution';
import {paint_program} from './code-painter';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#inputVector').val().split(',');
        let parsedCode = parseCode(codeToParse);
        let substituted_code = substitute_program_expr(parsedCode);
        $('#parsedCode').val(substituted_code);
        let painted_string = paint_program(parsedCode,inputVector);
        let painted_code_selector = $('#paintedCode');
        painted_code_selector.empty();
        let split_painted_string = painted_string.split('\n');
        painted_string = '<label>Code after painting</label>\n<pre>';
        split_painted_string.forEach((str)=> painted_string+=str + '<br>');
        painted_string+='</pre>';
        painted_code_selector.append(painted_string);
    });
});

