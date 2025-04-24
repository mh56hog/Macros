javascript
// Global variables
let recipe = {
    name: '',
    servings: 0,
    ingredients: [],
    totalMacros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
};

// DOM elements
const ingredientsContainer = document.getElementById('ingredients-container');
const addIngredientBtn = document.getElementById('add-ingredient');
const calculateBtn = document.getElementById('calculate-btn');
const resultsSection = document.getElementById('results-section');

// Target macros sliders
const targetCaloriesSlider = document.getElementById('target-calories');
const proteinPercentSlider = document.getElementById('protein-percent');
const carbsPercentSlider = document.getElementById('carbs-percent');
const fatPercentSlider = document.getElementById('fat-percent');

// Initialize the app
function init() {
    // Add event listeners
    addIngredientBtn.addEventListener('click', addIngredientRow);
    calculateBtn.addEventListener('click', calculateAdjustedRecipe);
    
    // Initialize first ingredient row remove button
    const firstIngredientRow = document.querySelector('.ingredient-row');
    const firstRemoveBtn = firstIngredientRow.querySelector('.remove-ingredient');
    firstRemoveBtn.addEventListener('click', function() {
        removeIngredientRow(this);
    });
    
    // Initialize input event listeners for the first ingredient
    initializeIngredientInputs(firstIngredientRow);
    
    // Macro percentage sliders
    initializeMacroSliders();
    
    // Update totals when inputs change
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('macro-calories') || 
            e.target.classList.contains('macro-protein') || 
            e.target.classList.contains('macro-carbs') || 
            e.target.classList.contains('macro-fat')) {
            calculateTotalMacros();
        }
    });
}

// Add a new ingredient row
function addIngredientRow() {
    // Clone the first ingredient row
    const template = document.querySelector('.ingredient-row');
    const newRow = template.cloneNode(true);
    
    // Clear input values
    const inputs = newRow.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    
    // Add event listener to remove button
    const removeBtn = newRow.querySelector('.remove-ingredient');
    removeBtn.addEventListener('click', function() {
        removeIngredientRow(this);
    });
    
    // Initialize input listeners
    initializeIngredientInputs(newRow);
    
    // Add to container
    ingredientsContainer.appendChild(newRow);
}

// Remove an ingredient row
function removeIngredientRow(button) {
    const row = button.closest('.ingredient-row');
    // Only remove if there's more than one ingredient
    if (document.querySelectorAll('.ingredient-row').length > 1) {
        row.remove();
        calculateTotalMacros();
    }
}

// Initialize input listeners for an ingredient row
function initializeIngredientInputs(row) {
    // Add event listeners to update calculations
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            calculateTotalMacros();
        });
    });
}

// Calculate and update total macros
function calculateTotalMacros() {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // Loop through all ingredient rows
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    ingredientRows.forEach(row => {
        const calories = parseFloat(row.querySelector('.macro-calories').value) || 0;
        const protein = parseFloat(row.querySelector('.macro-protein').value) || 0;
        const carbs = parseFloat(row.querySelector('.macro-carbs').value) || 0;
        const fat = parseFloat(row.querySelector('.macro-fat').value) || 0;
        
        totalCalories += calories;
        totalProtein += protein;
        totalCarbs += carbs;
        totalFat += fat;
    });
    
    // Update the totals display
    document.getElementById('total-calories').textContent = Math.round(totalCalories);
    document.getElementById('total-protein').textContent = totalProtein.toFixed(1);
    document.getElementById('total-carbs').textContent = totalCarbs.toFixed(1);
    document.getElementById('total-fat').textContent = totalFat.toFixed(1);
    
    // Store the totals in the recipe object
    recipe.totalMacros = {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
    };
    
    // Update target calories slider
    targetCaloriesSlider.value = totalCalories;
    targetCaloriesSlider.max = Math.max(2000, totalCalories * 1.5);
    document.getElementById('target-calories-display').textContent = Math.round(totalCalories);
}

// Initialize macro percentage sliders
function initializeMacroSliders() {
    // Update displays when sliders change
    targetCaloriesSlider.addEventListener('input', function() {
        document.getElementById('target-calories-display').textContent = this.value;
    });
    
    proteinPercentSlider.addEventListener('input', function() {
        document.getElementById('protein-percent-display').textContent = this.value + '%';
        updateMacroTotal();
    });
    
    carbsPercentSlider.addEventListener('input', function() {
        document.getElementById('carbs-percent-display').textContent = this.value + '%';
        updateMacroTotal();
    });
    
    fatPercentSlider.addEventListener('input', function() {
        document.getElementById('fat-percent-display').textContent = this.value + '%';
        updateMacroTotal();
    });
    
    // Initial update
    updateMacroTotal();
}

// Update macro total percentage display
function updateMacroTotal() {
    const proteinPercent = parseInt(proteinPercentSlider.value);
    const carbsPercent = parseInt(carbsPercentSlider.value);
    const fatPercent = parseInt(fatPercentSlider.value);
    
    const total = proteinPercent + carbsPercent + fatPercent;
    const macroTotal = document.getElementById('macro-total');
    
    macroTotal.textContent = `Total: ${total}%`;
    
    if (total === 100) {
        macroTotal.classList.add('valid');
        macroTotal.classList.remove('invalid');
        calculateBtn.disabled = false;
    } else {
        macroTotal.classList.add('invalid');
        macroTotal.classList.remove('valid');
        calculateBtn.disabled = true;
    }
}

// Calculate the adjusted recipe based on target macros
function calculateAdjustedRecipe() {
    // Get the current recipe data
    recipe.name = document.getElementById('recipe-name').value || 'Untitled Recipe';
    recipe.servings = parseInt(document.getElementById('servings').value) || 1;
    
    // Create ingredient objects from the UI
    recipe.ingredients = [];
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    
    ingredientRows.forEach(row => {
        const name = row.querySelector('.ingredient-name').value;
        const quantity = parseFloat(row.querySelector('.ingredient-quantity').value) || 0;
        const unit = row.querySelector('.ingredient-unit').value;
        const calories = parseFloat(row.querySelector('.macro-calories').value) || 0;
        const protein = parseFloat(row.querySelector('.macro-protein').value) || 0;
        const carbs = parseFloat(row.querySelector('.macro-carbs').value) || 0;
        const fat = parseFloat(row.querySelector('.macro-fat').value) || 0;
        
        if (name && quantity > 0) {
            recipe.ingredients.push({
                name,
                quantity,
                unit,
                macros: { calories, protein, carbs, fat }
            });
        }
    });
    
    // Get target values
    const targetCalories = parseInt(targetCaloriesSlider.value);
    const proteinPercent = parseInt(proteinPercentSlider.value);
    const carbsPercent = parseInt(carbsPercentSlider.value);
    const fatPercent = parseInt(fatPercentSlider.value);
    
    // Calculate scaling factor based on calories
    const calorieScalingFactor = targetCalories / recipe.totalMacros.calories;
    
    // Create the adjusted recipe
    const adjustedRecipe = {
        name: recipe.name,
        servings: recipe.servings,
        ingredients: [],
        totalMacros: {
            calories: targetCalories,
            protein: (targetCalories * (proteinPercent / 100) / 4), // 4 calories per gram of protein
            carbs: (targetCalories * (carbsPercent / 100) / 4),     // 4 calories per gram of carbs
            fat: (targetCalories * (fatPercent / 100) / 9)          // 9 calories per gram of fat
        }
    };
    
    // Scale each ingredient
    recipe.ingredients.forEach(ingredient => {
        const adjustedIngredient = {
            name: ingredient.name,
            quantity: ingredient.quantity * calorieScalingFactor,
            unit: ingredient.unit,
            macros: {
                calories: ingredient.macros.calories * calorieScalingFactor,
                protein: ingredient.macros.protein * calorieScalingFactor,
                carbs: ingredient.macros.carbs * calorieScalingFactor,
                fat: ingredient.macros.fat * calorieScalingFactor
            }
        };
        
        adjustedRecipe.ingredients.push(adjustedIngredient);
    });
    
    // Display the results
    displayResults(recipe, adjustedRecipe);
}

// Display the adjusted recipe results
function displayResults(originalRecipe, adjustedRecipe) {
    // Show the results section
    resultsSection.style.display = 'block';
    
    // Clear previous results
    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = '';
    
    // Add each ingredient to the results table
    adjustedRecipe.ingredients.forEach((ingredient, index) => {
        const original = originalRecipe.ingredients[index];
        
        const row = document.createElement('tr');
        
        // Ingredient name
        const nameCell = document.createElement('td');
        nameCell.textContent = ingredient.name;
        row.appendChild(nameCell);
        
        // Original quantity
        const originalCell = document.createElement('td');
        originalCell.textContent = `${original.quantity.toFixed(1)} ${original.unit}`;
        row.appendChild(originalCell);
        
        // Adjusted quantity
        const adjustedCell = document.createElement('td');
        const adjustedText = document.createElement('span');
        adjustedText.textContent = `${ingredient.quantity.toFixed(1)} ${ingredient.unit}`;
        
        // Highlight changes
        if (Math.abs(original.quantity - ingredient.quantity) > 0.01) {
            adjustedText.classList.add('changed-value');
        }
        
        adjustedCell.appendChild(adjustedText);
        row.appendChild(adjustedCell);
        
        resultsTable.appendChild(row);
    });
    
    // Update original macros
    document.getElementById('original-calories').textContent = Math.round(originalRecipe.totalMacros.calories);
    document.getElementById('original-protein').textContent = originalRecipe.totalMacros.protein.toFixed(1);
    document.getElementById('original-carbs').textContent = originalRecipe.totalMacros.carbs.toFixed(1);
    document.getElementById('original-fat').textContent = originalRecipe.totalMacros.fat.toFixed(1);
    
    // Calculate original percentages
    const originalCalories = originalRecipe.totalMacros.calories;
    const originalProteinPct = Math.round((originalRecipe.totalMacros.protein * 4 / originalCalories) * 100);
    const originalCarbsPct = Math.round((originalRecipe.totalMacros.carbs * 4 / originalCalories) * 100);
    const originalFatPct = Math.round((originalRecipe.totalMacros.fat * 9 / originalCalories) * 100);
    
    document.getElementById('original-protein-pct').textContent = originalProteinPct;
    document.getElementById('original-carbs-pct').textContent = originalCarbsPct;
    document.getElementById('original-fat-pct').textContent = originalFatPct;
    
    // Update adjusted macros
    document.getElementById('adjusted-calories').textContent = Math.round(adjustedRecipe.totalMacros.calories);
    document.getElementById('adjusted-protein').textContent = adjustedRecipe.totalMacros.protein.toFixed(1);
    document.getElementById('adjusted-carbs').textContent = adjustedRecipe.totalMacros.carbs.toFixed(1);
    document.getElementById('adjusted-fat').textContent = adjustedRecipe.totalMacros.fat.toFixed(1);
    
    // Adjusted percentages match the slider values
    document.getElementById('adjusted-protein-pct').textContent = proteinPercentSlider.value;
    document.getElementById('adjusted-carbs-pct').textContent = carbsPercentSlider.value;
    document.getElementById('adjusted-fat-pct').textContent = fatPercentSlider.value;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
