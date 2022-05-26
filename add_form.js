/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/log', 'N/ui/serverWidget', 'N/record', 'N/search'], function(log, ui, record, search) {
    function addQuoteToItem(itemsArray) {
        let arrayOfWords = [];
        for (let i = 0; i < itemsArray.length; i++) {
            let txt = "'";
            txt += itemsArray[i] + "'";
            arrayOfWords.push(txt);
        }
        return arrayOfWords;
    };

    return {
    beforeLoad: function (context)
    {   
        log.debug({
            title: 'context type',
            details: context.type
        })
        if (context.type === 'view') {
            let itemsId = [];
        let woData;
        let tab = context.form.addTab({ id : 'custpage_work_orders' ,label : 'Work Order' })
        // log.debug({
        //     title: 'item receipt',
        //     details: 'Działa'
        // })

        
        let objSublist = context.form.addSublist( {id: 'custpage_sublist1' ,type: ui.SublistType.STATICLIST ,label: 'List of Work Orders' ,tab: 'custpage_work_orders' });
        const recid = context.newRecord.id;

        // log.debug({title: 'record:', details: recid})

        const IRobj = record.load({
            type: record.Type.ITEM_RECEIPT,
            id: recid,
        })
        const numLines = IRobj.getLineCount({
            sublistId: 'item'
        });
        //log.debug({title: 'numLines: ', details: numLines})
        
        for (var i = 0; i < numLines; i++) {
            const internalid_item = IRobj.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });
            itemsId.push(internalid_item)
            log.debug({title: 'item: ', details: internalid_item})
        }

        let items = addQuoteToItem(itemsId).toString();
        const filter1 = search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        });
        const filter2 = search.createFilter({
            name: 'formulanumeric',
            operator: search.Operator.EQUALTO,
            values: [1],
            formula: 'CASE WHEN {item.internalid} IN('+ items +') THEN 1 ELSE 0 END'
        });
        const filter3 = search.createFilter({
            name: 'status',
            operator: search.Operator.ANYOF,
            values: 'WorkOrd:D'
        });
        const filter4 = search.createFilter({
            name: 'formulanumeric',
            operator: search.Operator.EQUALTO,
            values: [1],
            formula: 'CASE WHEN ({quantity}-{quantityshiprecv})>0 THEN 1 ELSE 0 END'
        });
        const filter5 = search.createFilter({
            name: 'islotitem',
            join: 'item',
            operator: search.Operator.IS,
            values: false
        });
        const column1 = search.createColumn({
            name: 'internalid'
        });
        const column2 = search.createColumn({
            name: 'tranid'
        });
        const column3 = search.createColumn({
            name: 'startdate'
        });
        const column4 = search.createColumn({
            name:'item'
        });
        const column5 = search.createColumn({
            name: 'custbody_plr_prod_serial_no'
        });
        const column6 = search.createColumn({
            name: 'enddate',
            sort: search.Sort.ASC
        });
        const column7 = search.createColumn({
            name: 'custbody46'
        });
        const column8 = search.createColumn({
            name: 'createdfrom'
        });
        const srch = search.create({
            type: search.Type.WORK_ORDER,
            filters: [filter1, filter2, filter3, filter4, filter5],
            columns: [column1, column2, column3, column4, column5, column6, column7, column8]
        });
        let pagedResults = srch.runPaged();
        pagedResults.pageRanges.forEach(function(pageRange) {
            let currentPage = pagedResults.fetch({index: pageRange.index});
            let data = currentPage.data;
            let parsedData = JSON.parse(JSON.stringify(data))
            log.debug({
                title: 'data',
                details: parsedData
            });
            woData = parsedData;
        });
        objSublist.addField({
            id: 'sublist1',
            type: ui.FieldType.TEXT,
            label: 'Issue'
        });
        objSublist.addField({
            id: 'sublist2',
            type: ui.FieldType.TEXT,
            label: 'Internal ID'
        });
        objSublist.addField({
            id: 'sublist3',
            type: ui.FieldType.TEXT,
            label: 'Transaction ID'
        });
        
        objSublist.addField({
            id: 'sublist4',
            type: ui.FieldType.TEXT,
            label: 'Item'
        });
        objSublist.addField({
            id: 'sublist5',
            type: ui.FieldType.TEXT,
            label: 'WO End Date'
        });
        objSublist.addField({
            id: 'sublist6',
            type: ui.FieldType.TEXT,
            label: 'Assembly'
        });

            log.debug({
                title: 'woData',
                details: woData
            });
            if (woData) {
                for(let i = 0; i < woData.length; i++) {
                    log.debug({
                        title: 'woData',
                        details: woData[i]
                    });
                    objSublist.setSublistValue({
                        id: 'sublist1',
                        line: i,
                        value: '<a href="https://5015679.app.netsuite.com/app/accounting/transactions/woissue.nl?id='+ woData[i].id +'&e=T&transform=workord&memdoc=0&whence=" target="_blank">Issue</a>'
                    });
                    objSublist.setSublistValue({
                        id: 'sublist2',
                        line: i,
                        value: woData[i].id
                    });
                    objSublist.setSublistValue({
                        id: 'sublist3',
                        line: i,
                        value: woData[i].values.tranid
                    });
                    
                    objSublist.setSublistValue({
                        id: 'sublist4',
                        line: i,
                        value: woData[i].values.item[0].text
                    });
                    objSublist.setSublistValue({
                        id: 'sublist5',
                        line: i,
                        value: woData[i].values.enddate
                    });
                    if (woData[i].values.custbody46[0] === undefined) {
                        objSublist.setSublistValue({
                            id: 'sublist6',
                            line: i,
                            value: 'NO DATA'
                        });
                    }
                    if (woData[i].values.custbody46[0] !== undefined) {
                        objSublist.setSublistValue({
                            id: 'sublist6',
                            line: i,
                            value: '<a href="https://5015679.app.netsuite.com/app/common/item/item.nl?id='+ woData[i].values.item[0].value +'" target="_blank">' + woData[i].values.custbody46[0]["text"] + '</a>'
                        });
                    } 
                   
                    
                    
                }
            }
        
        }
        
        
        
    }
    };
   });
   
 
