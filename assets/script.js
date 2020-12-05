/*
     Project    : Budget Management Project using HTML, CSS, Javascript, jQuery
     Created by : K. Deepak Kumar
     Contact at : deepakplay14@gmail.com
*/

// MVC Pattern using IIFE
"use strict";
$(document).ready(function(){
    const budgetModel = (function(){   // Model Controller //

        // IIFE Closures //

        // Budget Class
        class Income{
            constructor(id, description, value){
                this.id = id;
                this.description = description;
                this.value = value;
            }
        }

        class Expenses extends Income{
            constructor(id, description, value){
                super(id, description, value)
            }
            percentage(){
                let income = budget.netTotal.inc();
                if(income>0) return Math.floor((this.value/income)*100);
                return 0;
            }
        }
        
        // test data
        let testInc = [ new Income(1, 'Project', 10000),
                        new Income(2, 'Rent', 6000),
                        new Income(3, 'Product Sale', 20000)];

        let textExp = [ new Expenses(1,'Electricity Bill',3000),
                        new Expenses(2,'House Renovation',10000)];
        
        // budget state storage
        const budget = {
            budgetList : { 
                inc: [...testInc],
                exp: [...textExp],
            },
            netTotal:{
                inc: ()=> budget.budgetList.inc.reduce((total,value)=>total+value.value, 0),
                exp: ()=> budget.budgetList.exp.reduce((total,value)=>total+value.value, 0)
            },
            grossTotal:function(){
                return this.netTotal.inc() - this.netTotal.exp();
            },
            grossPercentage:function(){
                let income = this.netTotal.inc();
                let expenses = this.netTotal.exp();
                if(income>0) return Math.floor((expenses/income)*100);
                return 0;
            }
        };

        // state CRUD functions (create, read, update and delete)  //

        //Create Function
        const addBudget = function(obj){
            const id=(budget.budgetList[obj.type].length)?budget.budgetList[obj.type][budget.budgetList[obj.type].length-1].id+1:1;
            budget.budgetList[obj.type].push((obj.type==='inc')?new Income(id,obj.description,obj.value):new Expenses(id,obj.description,obj.value));
            obj.id=id;
            return obj;
        };

        //Read Function for individual expenses item percentage
        const getPercentage = function(){
            return budget.budgetList['exp'].map((item)=>{
                return {
                    percentage: item.percentage(),
                    id: item.id,
                }
            });
        };

        //Update Function 
        const updateBudget = function(obj){
            const index =  budget.budgetList[obj.type].findIndex((item)=>item.id===obj.id);
            budget.budgetList[obj.type][index].description = obj.description;
            budget.budgetList[obj.type][index].value = obj.value;
        };

        //Delete Function
        const deleteBudget = function(obj){
            const index =  budget.budgetList[obj.type].findIndex((item)=>item.id===obj.id);
            budget.budgetList[obj.type].splice(index, 1);
        };
        
        return {  // Public Accessable Objects
           // test: ()=>{
                //console.log(budget.budgetList.inc);
                //console.log(budget.budgetList.exp);
                //console.log(budget.netTotal.inc());
                //console.log(budget.netTotal.exp());
                //console.log(budget.grossTotal());
                //console.log(budget.grossPercentage());
           // },
            getFull:function(){
                return{
                    total: budget.grossTotal(),
                    income: budget.netTotal.inc(),
                    expenses: budget.netTotal.exp(),
                    percentage: budget.grossPercentage()
                }
            }
            ,
            addBudget: addBudget ,
            deleteBudget:deleteBudget,
            getPercentage:getPercentage,
            getAll: ()=>budget.budgetList, //Read all Budget function
            deleteBudget:deleteBudget,
            updateBudget:updateBudget
        };        
    })();
    //  budgetModel.test();

    //////////////////////////////////////////////////////
    const budgetView = (function(){  // View UI Controller //

        //DOM Strings
        const budgetDOM = {
            budgetDate : '.budgetDate',
            budgetTotal : '.total',
            budgetIncome : '.totalIncome',
            budgetExpenses : '.totalExpenses',
            budgetPercentage : '.expensesPercentage',
            inputType : '#bgType',
            inputDescription: '#bgdescription',
            inputValue: '#bgamount',
            inputSubmit: '#bgsubmit',
            itemContainer: '.bgContainer',
            itemDescription: '.itemDescription',
            itemValue: '.itemValue',
            itemEdit : 'edit',
            itemDelete: 'delete',
            itemPercentage: '.expensesPercentage',
            inputError:'errorInput',
            itemPercentage: '.itemPercentage',
            submitError:'errorsubmit',
            incomeList:'.incomeBg>ul',
            expensesList:'.expensesBg>ul'
        }
        
        //Read UI input with validation
        const getValue = function(){
            let state=true;
            const obj = {};

            let input = $(budgetDOM.inputType);
            let description = $(budgetDOM.inputDescription);
            let value = $(budgetDOM.inputValue);
            let submit = $(budgetDOM.inputSubmit);

            obj.type = (input.val()==='+')?'inc':'exp';         //Get Type

            obj.description = description.val();                //Get Description
            if(obj.description===''){   // is valid
                state=false;
                if(!description.hasClass(budgetDOM.inputError)){
                    description.addClass(budgetDOM.inputError);    
                }
            }else{
                description.removeClass(budgetDOM.inputError);
            }

            obj.value = parseInt(value.val());                  //Get Value
            if(obj.value<=0 || isNaN(obj.value)){ // is valid
                state=false;
                if(!value.hasClass(budgetDOM.inputError)){
                    value.addClass(budgetDOM.inputError);
                }
            }else{
                value.removeClass(budgetDOM.inputError);
            }

            if(!state){                                         //Check Valid data
                if(!submit.hasClass(budgetDOM.submitError)){
                    submit.addClass(budgetDOM.submitError);
                }
            }else{
                description.val('').focus(); // if valid
                value.val('');
                submit.removeClass(budgetDOM.submitError);
            }
            return state?obj:state;
        };

        // Update Top UI Budget Pannel
        const updateBudget = function(budget){
            $(budgetDOM.budgetTotal).text(formateNumber(budget.total, (budget.total<0)?'exp':'inc'));
            $(budgetDOM.budgetIncome).text(formateNumber(budget.income,'inc'));
            $(budgetDOM.budgetExpenses).text(formateNumber(budget.expenses,'exp'));
            $(budgetDOM.budgetPercentage).text(budget.percentage+'%');            
        }

        //Add Budget Item to UI 
        const addBudget = function(obj){
            let html, list;
            if(obj.type==='inc'){ // Add Budget to UI Income List
                html  =$(`
                    <li class="inc-${obj.id}">
                        <span class="${(budgetDOM.itemDescription).substr(1)}">${obj.description}</span>
                        <div>
                            <span class="${(budgetDOM.itemValue).substr(1)}">${formateNumber(obj.value, obj.type)}</span>
                            <button class="${(budgetDOM.itemEdit)}"><i class="fas fa-pen"></i></button>
                            <button class="${(budgetDOM.itemDelete)}"><i class="fas fa-trash"></i></button>
                        </div>
                    </li>
                `);
                list = $(budgetDOM.incomeList);
            }else if(obj.type='exp'){  // Add Budget to UI Expenses List
                html = $(`
                <li class="exp-${obj.id}">
                    <span class="${(budgetDOM.itemDescription).substr(1)}">${obj.description}</span>
                    <div>
                        <span class="${(budgetDOM.itemValue).substr(1)}">${formateNumber(obj.value, obj.type)}</span>
                        <span class="${(budgetDOM.itemPercentage).substr(1)}">0%</span>
                        <button class="${(budgetDOM.itemEdit)}"><i class="fas fa-pen"></i></button>
                        <button class="${(budgetDOM.itemDelete)}"><i class="fas fa-trash"></i></button>
                    </div>
                </li>
                `);
                list = $(budgetDOM.expensesList);
            }
            html.hide();
            list.append(html);
            html.slideDown(200);
        };

        //Formate number
        const formateNumber = function(value, type){
            let valArr = (Math.abs(value)).toFixed(2).split('.');
            let newArr = [];
            for(let i=valArr[0].length-1,pos=3; i>=0; i--){
                newArr.unshift(valArr[0][i]);
                if(i===(valArr[0].length - pos) && i!==0 ){
                    newArr.unshift(',');
                    pos+=2;
                }
            }
            valArr[0] = newArr.join('')
            return ((type==='inc')?'+ ':'- ') + valArr.join('.');
        };

        // Update Expenses Percentage UI
        const updatePercentage = function(arr){
            for(let obj of arr){
                $('.exp-'+obj.id+' .itemPercentage').text(obj.percentage+'%');
            }
        };

        return {
            budgetDOM: budgetDOM,
            getValue: getValue,
            addBudget:addBudget,
            updateBudget: updateBudget,
            updatePercentage:updatePercentage,
            getItem:function(item){  //Get Item Values from UI
                let target = $('.'+item);
                item = item.split('-');
                let obj = {type:item[0], id:parseInt(item[1])}
                obj.description = $('.'+target.attr('class')+' '+budgetDOM.itemDescription).text();
                obj.value = parseFloat(($('.'+target.attr('class')+' '+budgetDOM.itemValue).text()).replace(/[^.\d]/g, ''))
                return obj;
            },
            setItem:function(obj){  //Set Item Values to UI
                let target = $('.'+obj.type+'-'+obj.id);
				let des = $('.'+target.attr('class')+' '+budgetDOM.itemDescription);
				let val = $('.'+target.attr('class')+' '+budgetDOM.itemValue);
				des.hide(0);
				val.hide(0);
                des.text(obj.description);
                val.text(formateNumber(obj.value, obj.type));
				des.fadeIn(200);
				val.fadeIn(200);
            },
            itemRemove:function(item){  //Remove Item from UI
                item.slideUp(200, function(){
                    $(this).remove();
                });
            },
            removeAll:function(){  //Clear all Items from the UI
                $(budgetDOM.incomeList).empty();
                $(budgetDOM.expensesList).empty();
            }
        };
    })();

    /////////////////////////////////////////////////////////////////
    const budgetControl = (function(model, view){ //Main Controller
        const budgetDOM = view.budgetDOM;
        
        const setDate = function(){  //Set Date
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augest','September', 'October', 'November', 'December'];
            const date = new Date();
            $(budgetDOM.budgetDate).text(months[date.getMonth()]+ ' ' + date.getFullYear());
        }
     
        const update = function(){  //Update Controller for (UI & Budget)
            view.updateBudget(model.getFull());
            view.updatePercentage(model.getPercentage());
        }

        const submit = function(event){  // Submit Event Function
            if(event.type ==='click' || event.which === 13){
                const bgValue = view.getValue();
                if(bgValue){
                    view.addBudget(model.addBudget(bgValue));
                    update();
                }
            }
        }

        const itemEvent = function(event){  // Item Edit, Delete Delegated Event Function
            let target = $(event.target), item;
            if(target.parent().hasClass(budgetDOM.itemDelete) || target.hasClass(budgetDOM.itemDelete) ){ // Check Item Delete
                target = target.closest('li');
                item = target.attr('class').split('-');
                view.itemRemove(target);
                model.deleteBudget({type:item[0], id:parseInt(item[1])});
                update();
            }else if(target.parent().hasClass(budgetDOM.itemEdit) || target.hasClass(budgetDOM.itemEdit)){ // Check Item Edit 
                target = target.closest('li');
                item = view.getItem(target.attr('class')) //obj
                item.description = prompt("Enter new Description: ", item.description) || item.description;
                item.value = Math.abs(parseFloat(prompt("Enter new value: ", item.value))) || item.value;
                model.updateBudget(item);
                view.setItem(item);
                update();
            }
        }

        const setEvent = function(){  // Setting up Event
            $(document).keypress(submit);
            $(budgetDOM.inputSubmit).click(submit);
            $(budgetDOM.itemContainer).click(itemEvent);
        }

        const initBG = function(){    // Load Budget from Database
            view.removeAll(); //Clear all items
            let list = model.getAll();  // Get Items from State

            for(let type in list){  //Load Items to UI
                list[type].forEach((item)=>{
                    view.addBudget({
                        type: type,
                        id: item.id,
                        description: item.description,
                        value: item.value,
                    })
                });
            }
        }

        return {
            init: function(){ //Initilize function
                setDate();
                setEvent();
                initBG();
                update();
            }
        };
    })(budgetModel, budgetView);
    budgetControl.init(); // Run Initilize 
});
