var globalBind_for_findPathToBins = null;
$.runScript = {
	PathTree: function () {
		const proj = app.project;
		function walkBins(parent, currentPos) {
			for (var i = 0; i < currentPos.children.numItems; i++) {
				if (currentPos.children[i].type == ProjectItemType.BIN) {
					parent.push(currentPos.children[i].name);
					var smallPath = parent.join(" -> ");
					depth += 1;
					id.push(depth.toString() + "." + (i + 1).toString());
					idList.push([currentPos.children[i].name, id.join("-")]);
					globalPath.push(smallPath);
					walkBins(parent, currentPos.children[i]);
					id.pop()
					depth -= 1;
					parent.pop();
				} else {
					parent.push(currentPos.children[i].name);
					var smallPath = parent.join(" -> ");
					depth += 1;
					id.push(depth.toString() + "." + (i + 1).toString());
					idList.push([currentPos.children[i].name, id.join("-")]);
					globalPath.push(smallPath);
					depth -= 1;
					id.pop()
					parent.pop();
				}
			}
		}
		var parent = [proj.rootItem.name];
		var globalPath = [];
		var idList = [];
		var id = [];
		var depth = 0;
		walkBins(parent, proj.rootItem);
		alert(globalPath.join('\n') + "\n\n" + idList.join("\n"));
	},

	Walker: function () {
		alert("2");
		const proj = app.project;
		var treeData = '{"name":"' + proj.rootItem.name + '","children":['; // Start the JSON string with the root item

		// Define a recursive function to walk through project items and build the JSON string
		function walkItems(item) {
			for (var i = 0; i < item.children.numItems; i++) {
				if (i > 0) {
					treeData += ','; // Add comma between sibling elements
				}
				treeData += '{"name":"' + item.children[i].name + '"';
				// If the current child is a BIN, recursively add its children
				if (item.children[i].type == ProjectItemType.BIN) {
					treeData += ',"children":[';
					walkItems(item.children[i]);
					treeData += ']';
				}
				treeData += '}';
			}
		}

		// Start building the JSON string by traversing through project items
		walkItems(proj.rootItem);

		// Close the JSON string
		treeData += ']}';
		// Display or use treeData as needed
		alert("1-ES", treeData);
		// Return treeData if needed
		//return ({"name":"Testing_PalmTreeLake.prproj","children":[{"name":"Movies","children":[{"name":"Sequences","children":[{"name":"tester","children":[{"name":"a","children":[]},{"name":"b","children":[]},{"name":"c","children":[]},{"name":"d","children":[]},{"name":"file"},{"name":"file 2"}]}]}]},{"name":"Bin0","children":[{"name":"Bin1","children":[]}]},{"name":"preset sequence 1"}]});
		return treeData;
	},
	findElement: function (currentElement, nameToFind) {
		if (nameToFind) {
			for (var i = 0; i < currentElement.children.length; i++) {
				var currentChild = currentElement.children[i];
				// Check if the current child matches the nameToFind
				if (currentChild.name.toUpperCase() == nameToFind.toUpperCase()) {
					globalBind_for_findPathToBins = currentChild;
					return currentChild;
				} else if (currentChild.type == ProjectItemType.BIN) {
					// If the current child is a bin, recursively search within it
					var foundChild = $.runScript.findElement(currentChild, nameToFind);
					if (foundChild) {
						return foundChild;
					}
				}
			}
		} else {
			alert("No item was targeted");
			return (0);
		}
	},
	Renamer: function (checkedCheckboxes, textInputValues) {//, binAlteredContent) {
		var proj = app.project;
		//currentElement = start location, nameToFind = target Bin

		//["All files in BIN","Include BIN","Append (alternative to rename)"]
		//var checkedCheckboxes =["Append (alternative to rename)","All files in BIN","Include BIN"];
		//var textInputValues = ["gh","1"];
		var findMe = textInputValues[0];
		var newVal = textInputValues[1];
		if (textInputValues.length == 3) {
			var inBINOp = textInputValues[2];
			alert(inBINOp, "inBinOp");
		}

		$.runScript.findElement(proj.rootItem, findMe);

		var inBIN = false;
		var allSubDir = false;
		var withBIN = false;
		var appToFiles = false;
		
		// checks which check boxes have been checked
		for (i = 0; i < checkedCheckboxes.length; i++) {
			if (checkedCheckboxes[i].toString() == "All files in BIN") {
				if (inBINOp) {
					inBIN = true;
				} else { alert('need to select option for All files in BIN') }
			}else if((inBIN) && (checkedCheckboxes[i].toString() == "allSubsCheckbox")){
				allSubDir = true;
			} else if (checkedCheckboxes[i].toString() == "Include BIN") {
				withBIN = true;
			} else if (checkedCheckboxes[i].toString() == "Append (alternative to rename)") {
				appToFiles = true;
			}
		}
		if (globalBind_for_findPathToBins != null) {

			var targetBin = globalBind_for_findPathToBins;
			// if appending
			if (appToFiles) {
				if (withBIN || targetBin.type != ProjectItemType.BIN) {
					targetBin.name = targetBin.name + newVal;
				} if ((targetBin.type == ProjectItemType.BIN) && (inBIN)) {
					if (inBINOp == "all") {
						for (var i = 0; i < targetBin.children.length; i++) {
							targetBin.children[i].name = targetBin.children[i].name + newVal;
							if(allSubDir && targetBin.children[i].type == ProjectItemType.BIN){
								$.runScript.Renamer(checkedCheckboxes, [targetBin.children[i].name,newVal,inBINOp]);
							}
						}
					} else if (inBINOp == "BINs") {
						for (var i = 0; i < targetBin.children.length; i++) {
							if (targetBin.children[i].type == ProjectItemType.BIN) {
								targetBin.children[i].name = targetBin.children[i].name + newVal;
							}
							if(allSubDir && targetBin.children[i].type == ProjectItemType.BIN){
								$.runScript.Renamer(checkedCheckboxes, [targetBin.children[i].name,newVal,inBINOp]);
							}
						}
					} else if (inBINOp == "loose") {
						for (var i = 0; i < targetBin.children.length; i++) {
							if (targetBin.children[i].type != ProjectItemType.BIN) {
								targetBin.children[i].name = targetBin.children[i].name + newVal;
							}
							if(allSubDir && targetBin.children[i].type == ProjectItemType.BIN){
								$.runScript.Renamer(checkedCheckboxes, [targetBin.children[i].name,newVal,inBINOp]);
							}
						}
					}
				}
			}
			// if changing
			else {
				if (withBIN || targetBin.type != ProjectItemType.BIN) {
					targetBin.name = newVal;
				} if ((targetBin.type == ProjectItemType.BIN) && (inBIN)) {
					if (inBINOp == "all") {
						for (var i = 0; i < targetBin.children.length; i++) {
							targetBin.children[i].name = newVal;
							if(allSubDir && targetBin.children[i].type == ProjectItemType.BIN){
								$.runScript.Renamer(checkedCheckboxes, [targetBin.children[i].name,newVal,inBINOp]);
							}
						}
					} else if (inBINOp == "BINs") {
						for (var i = 0; i < targetBin.children.length; i++) {
							if (targetBin.children[i].type == ProjectItemType.BIN) {
								targetBin.children[i].name = newVal;
							}
							if(allSubDir && targetBin.children[i].type == ProjectItemType.BIN){
								$.runScript.Renamer(checkedCheckboxes, [targetBin.children[i].name,newVal,inBINOp]);
							}
						}
					} else if (inBINOp == "loose") {
						for (var i = 0; i < targetBin.children.length; i++) {
							if (targetBin.children[i].type != ProjectItemType.BIN) {
								targetBin.children[i].name = newVal;
							}
							if(allSubDir && targetBin.children[i].type == ProjectItemType.BIN){
								$.runScript.Renamer(checkedCheckboxes, [targetBin.children[i].name,newVal,inBINOp]);
							}
						}
					}
				}
			}

			alert("changed");
		} else {
			alert("no bin was found within ");
		}
		globalBind_for_findPathToBins = null;


	},
	AlertMeta_getProjectMetadata: function (textInput) {
		if ($.runScript.findElement) {
			//try {
				$.runScript.findElement(app.project.rootItem, textInput);
				var targetItem = globalBind_for_findPathToBins;
				if (targetItem) {
					//alert('Target item found: ' + targetItem.name);
					//alert('Item metadata: ' + targetItem.getProjectMetadata());
					//alert('Item columns metadata: ' + targetItem.getProjectColumnsMetadata());
					//alert('Item XMP metadata: ' + targetItem.getXMPMetadata());

					return (targetItem.getProjectMetadata());
				}// else {
				//	alert('Target item not found'); // Debug alert
				//}
			//} catch (error) {
			//	alert('Error in executing findElement: ' + error); // Debug alert for any errors
			//}
		}// else {
		//	alert("findElement function not available");
		//}
	},

	AlertMeta_getProjectColumnsMetadata: function (textInput) {
		if ($.runScript.findElement) {
			//try {
				$.runScript.findElement(app.project.rootItem, textInput);
				var targetItem = globalBind_for_findPathToBins;
				if (targetItem) {
					//alert('Target item found: ' + targetItem.name);

					return (targetItem.getProjectColumnsMetadata());
				}// else {
				//	alert('Target item not found'); // Debug alert
				//
			//}// catch (error) {
			//	alert('Error in executing findElement: ' + error); // Debug alert for any errors
			//}
		}// else {
		//	alert("findElement function not available");
		//}
	},

	AlertMeta_getXMPMetadata: function (textInput) {
		if ($.runScript.findElement) {
			//try {
				$.runScript.findElement(app.project.rootItem, textInput);
				var targetItem = globalBind_for_findPathToBins;
				if (targetItem) {
					// var str=targetItem.getXMPMetadata();
					// var arr = str.split('</');
					// for (var i = 0; i < arr.length; i++) {
					// 	alert(arr[i]);
					// }

					return (targetItem.getXMPMetadata());
				}// else {
				//	alert('Target item not found'); // Debug alert
				//}
			//}// catch (error) {
			//	alert('Error in executing findElement: ' + error); // Debug alert for any errors
			//}
		}// else {
		//	alert("findElement function not available");
		//}
	}

}

