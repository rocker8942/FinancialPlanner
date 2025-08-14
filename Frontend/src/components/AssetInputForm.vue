<template>
  <form class="asset-form">
    <!-- Privacy Notice -->
    <div class="privacy-notice">
      <svg class="privacy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V7a2 2 0 114 0v4"></path>
      </svg>
      <span>Your data is encrypted and stored locally on your device for privacy and security.</span>
    </div>
    <!-- Person Profile Group -->
    <fieldset class="form-section" :class="{ 'section-active': sectionOpen.profile }">
      <legend class="form-section-title clickable" @click="toggleSection('profile')">
        <span class="chevron" :class="{ open: sectionOpen.profile }">&#9660;</span>
        Personal Profile
      </legend>
      <div v-show="sectionOpen.profile">
        <div class="form-group">
          <label>Relationship Status</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="single" v-model="relationshipStatus" />
              <span>Single</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="couple" v-model="relationshipStatus" />
              <span>Couple</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isHomeowner" />
            <span>I own my home</span>
          </label>
          <small class="help-text">Homeowner status affects age pension asset test thresholds</small>
        </div>
        <div class="form-group">
          <label for="currentAge">Current Age</label>
          <div class="input-with-buttons" :class="{ 'input-valid': isFieldValid('currentAge'), 'input-invalid': !isFieldValid('currentAge') && isFieldTouched('currentAge') }">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('currentAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('currentAge', -1)">-</button>
            <input 
              id="currentAge"
              v-model="currentAgeFormatted"
              @focus="onFocus('currentAge', $event)"
              @blur="onBlur('currentAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Current Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('currentAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('currentAge', 1)">+</button>
            <div v-if="isFieldValid('currentAge')" class="field-validation-icon valid">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <small v-if="!isFieldValid('currentAge') && isFieldTouched('currentAge')" class="validation-error">Please enter a valid age between 18 and 100</small>
        </div>
        <div class="form-group">
          <label for="retireAge">Your Retirement Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('retireAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('retireAge', -1)">-</button>
            <input 
              id="retireAge"
              v-model="retireAgeFormatted"
              @focus="onFocus('retireAge', $event)"
              @blur="onBlur('retireAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Retirement Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('retireAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('retireAge', 1)">+</button>
          </div>
          <small class="help-text">Age when salary income stops</small>
        </div>
        <div v-show="relationshipStatus === 'couple'" class="partner-section">
        <div class="form-group">
          <label for="partnerAge">Partner's Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerAge', -1)">-</button>
            <input 
              id="partnerAge"
              v-model="partnerAgeFormatted"
              @focus="onFocus('partnerAge', $event)"
              @blur="onBlur('partnerAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner's Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerAge', 1)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="partnerRetireAge">Partner's Retirement Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerRetireAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerRetireAge', -1)">-</button>
            <input 
              id="partnerRetireAge"
              v-model="partnerRetireAgeFormatted"
              @focus="onFocus('partnerRetireAge', $event)"
              @blur="onBlur('partnerRetireAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner's Retirement Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerRetireAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerRetireAge', 1)">+</button>
          </div>
        </div>
        </div>
      </div>
    </fieldset>

    <!-- Assets Group -->
    <fieldset class="form-section" :class="{ 'section-active': sectionOpen.assets }">
      <legend class="form-section-title clickable" @click="toggleSection('assets')">
        <span class="chevron" :class="{ open: sectionOpen.assets }">&#9660;</span>
        Assets
      </legend>
      <div v-show="sectionOpen.assets">
        <div class="form-group">
          <label for="propertyAssets">Investment Property</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyAssets', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyAssets', -1000)">-</button>
            <input 
              id="propertyAssets"
              v-model="propertyAssetsFormatted"
              @focus="onFocus('propertyAssets', $event)"
              @blur="onBlur('propertyAssets')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Investment Property ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyAssets', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyAssets', 1000)">+</button>
          </div>
          <small class="help-text">Real estate, land, and other property investments</small>
        </div>
        <div class="form-group">
          <label for="savings">Current Savings</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savings', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savings', -1000)">-</button>
            <input 
              id="savings"
              v-model="savingsFormatted"
              @focus="onFocus('savings', $event)"
              @blur="onBlur('savings')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Savings ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savings', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savings', 1000)">+</button>
          </div>
          <small class="help-text">Stocks, bonds, savings, and liquid investments</small>
        </div>


        <div class="form-group">
          <label for="mortgageBalance">Mortgage Balance</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageBalance', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageBalance', -1000)">-</button>
            <input 
              id="mortgageBalance"
              v-model="mortgageBalanceFormatted"
              @focus="onFocus('mortgageBalance', $event)"
              @blur="onBlur('mortgageBalance')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Mortgage Balance ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageBalance', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageBalance', 1000)">+</button>
          </div>
          <small class="help-text">Outstanding mortgage debt on property</small>
        </div>
        <div class="form-group">
          <label for="superannuationBalance">Superannuation Balance</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationBalance', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationBalance', -1000)">-</button>
            <input 
              id="superannuationBalance"
              v-model="superannuationBalanceFormatted"
              @focus="onFocus('superannuationBalance', $event)"
              @blur="onBlur('superannuationBalance')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Superannuation Balance ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationBalance', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationBalance', 1000)">+</button>
          </div>
          <small class="help-text">Current superannuation fund balance</small>
        </div>
      </div>
    </fieldset>

    <!-- Income and Expenses Group -->
    <fieldset class="form-section" :class="{ 'section-active': sectionOpen.income }">
      <legend class="form-section-title clickable" @click="toggleSection('income')">
        <span class="chevron" :class="{ open: sectionOpen.income }">&#9660;</span>
        Income and Expenses
      </legend>
      <div v-show="sectionOpen.income">
        <div class="form-group">
          <label for="salary">Your Annual Salary (Include super/tax)</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('salary', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('salary', -1000)">-</button>
            <input 
              id="salary"
              v-model="salaryFormatted"
              @focus="onFocus('salary', $event)"
              @blur="onBlur('salary')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Annual Salary ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('salary', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('salary', 1000)">+</button>
          </div>
        </div>
        <div v-show="relationshipStatus === 'couple'" class="form-group">
          <label for="partnerSalary">Partner's Annual Salary</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerSalary', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerSalary', -1000)">-</button>
            <input 
              id="partnerSalary"
              v-model="partnerSalaryFormatted"
              @focus="onFocus('partnerSalary', $event)"
              @blur="onBlur('partnerSalary')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner's Annual Salary ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerSalary', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerSalary', 1000)">+</button>
          </div>
        </div>
        <div class="form-group">
          <div class="label-with-toggle">
            <label for="expenses">Annual Expenses</label>
            <button type="button" 
                    class="toggle-switch" 
                    :class="{ active: zeroNetWorthAtDeath }"
                    @click="zeroNetWorthAtDeath = !zeroNetWorthAtDeath"
                    title="Auto-optimize expenses">
              <span class="toggle-slider"></span>
            </button>
          </div>
          <div class="input-with-buttons" :class="{ 'input-valid': isFieldValid('expenses'), 'input-invalid': !isFieldValid('expenses') && isFieldTouched('expenses') }">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('expenses', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('expenses', -1000)" :disabled="zeroNetWorthAtDeath">-</button>
            <input 
              id="expenses"
              v-model="expensesFormatted"
              @focus="onFocus('expenses', $event)"
              @blur="onBlur('expenses')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Annual Expenses ($)" 
              required 
              :disabled="zeroNetWorthAtDeath"
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('expenses', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('expenses', 1000)" :disabled="zeroNetWorthAtDeath">+</button>
            <div v-if="isFieldValid('expenses')" class="field-validation-icon valid">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <small v-if="expensesExceedMaxAllowable" class="validation-warning">
            ⚠️ Expenses exceed recommended maximum of {{ formatCurrency(maxAllowableExpense) }} and will be funded by drawing down financial assets beyond sustainable levels
          </small>
          <small v-else-if="expensesExceedDisposableIncome" class="validation-warning">
            ⚠️ Expenses exceed disposable income of {{ formatCurrency(currentDisposableIncome) }} and will be funded by drawing down {{ savings > 0 ? 'savings and ' : '' }}financial assets
          </small>
          <small v-else class="help-text">{{ zeroNetWorthAtDeath ? 'Auto-calculated based on your other inputs' : '' }}</small>
        </div>
        <!-- Calculated Age Pension section hidden as requested -->
        <!-- <div class="form-group">
          <label>Calculated Age Pension</label>
          <div class="pension-display">
            <div class="pension-item">
              <span class="pension-label">Your Pension (Annual):</span>
              <span class="pension-value">{{ formatCurrency(calculatedUserPension) }}</span>
            </div>
            <div v-show="relationshipStatus === 'couple'" class="pension-item">
              <span class="pension-label">Partner's Pension (Annual):</span>
              <span class="pension-value">{{ formatCurrency(calculatedPartnerPension) }}</span>
            </div>
            <div class="pension-item total">
              <span class="pension-label">Total Annual Pension:</span>
              <span class="pension-value">{{ formatCurrency(calculatedUserPension + calculatedPartnerPension) }}</span>
            </div>
          </div>
          <small class="help-text">Automatically calculated based on Australian age pension rules (2025 rates). Pension eligibility starts at age 67.</small>
        </div> -->
      </div>
    </fieldset>

    <!-- Advanced Options Group -->
    <fieldset class="form-section" :class="{ 'section-active': sectionOpen.advanced }">
      <legend class="form-section-title clickable" @click="toggleSection('advanced')">
        <span class="chevron" :class="{ open: sectionOpen.advanced }">&#9660;</span>
        Advanced Options
      </legend>
      <div v-show="sectionOpen.advanced">
        <div class="form-group">
          <label for="deathAge">Age the plan ends</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('deathAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('deathAge', -1)">-</button>
            <input 
              id="deathAge"
              v-model="deathAgeFormatted"
              @focus="onFocus('deathAge', $event)"
              @blur="onBlur('deathAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Target Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('deathAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('deathAge', 1)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="propertyGrowthRate">Property Growth Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyGrowthRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyGrowthRate', -0.5)">-</button>
            <input 
              id="propertyGrowthRate"
              v-model="propertyGrowthRateFormatted"
              @focus="onFocus('propertyGrowthRate', $event)"
              @blur="onBlur('propertyGrowthRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Growth Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyGrowthRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyGrowthRate', 0.5)">+</button>
          </div>
          <small class="help-text">Historic average property appreciation (default: 4%)</small>
        </div>
        <div class="form-group">
          <label for="propertyRentalYield">Property Rental Yield</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyRentalYield', -0.1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyRentalYield', -0.1)">-</button>
            <input 
              id="propertyRentalYield"
              v-model="propertyRentalYieldFormatted"
              @focus="onFocus('propertyRentalYield', $event)"
              @blur="onBlur('propertyRentalYield')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Rental Yield (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyRentalYield', 0.1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyRentalYield', 0.1)">+</button>
          </div>
          <small class="help-text">Net rental return after fees and tax (Australian average: 3.3%)</small>
        </div>
        <div class="form-group">
          <label for="savingsGrowthRate">Expected Savings Growth Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savingsGrowthRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savingsGrowthRate', -0.5)">-</button>
            <input 
              id="savingsGrowthRate"
              v-model="savingsGrowthRateFormatted"
              @focus="onFocus('savingsGrowthRate', $event)"
              @blur="onBlur('savingsGrowthRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Growth Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savingsGrowthRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savingsGrowthRate', 0.5)">+</button>
          </div>
          <small class="help-text">Expected annual return on your investments</small>
        </div>
        <div class="form-group">
          <label for="mortgageRate">Mortgage Interest Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageRate', -0.5)">-</button>
            <input 
              id="mortgageRate"
              v-model="mortgageRateFormatted"
              @focus="onFocus('mortgageRate', $event)"
              @blur="onBlur('mortgageRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Mortgage Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageRate', 0.5)">+</button>
          </div>
          <small class="help-text">Annual mortgage interest rate (default: 6%)</small>
        </div>
        <div class="form-group">
          <label for="superannuationRate">Superannuation Return Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationRate', -0.5)">-</button>
            <input 
              id="superannuationRate"
              v-model="superannuationRateFormatted"
              @focus="onFocus('superannuationRate', $event)"
              @blur="onBlur('superannuationRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Return Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationRate', 0.5)">+</button>
          </div>
          <small class="help-text">Expected annual return on superannuation (default: 7%)</small>
        </div>
        <div class="form-group">
          <label for="cpiGrowthRate">Consumer Price Index (CPI) Growth Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('cpiGrowthRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('cpiGrowthRate', -0.5)">-</button>
            <input 
              id="cpiGrowthRate"
              v-model="cpiGrowthRateFormatted"
              @focus="onFocus('cpiGrowthRate', $event)"
              @blur="onBlur('cpiGrowthRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="CPI Growth Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('cpiGrowthRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('cpiGrowthRate', 0.5)">+</button>
          </div>
          <small class="help-text">Consumer Price Index growth rate for expense escalation (default: 3%)</small>
        </div>
      </div>
    </fieldset>

    <div v-if="zeroNetWorthAtDeath" class="form-group">
      <small class="help-text">When enabled, your annual expenses will be automatically calculated and adjusted based on your other inputs to ensure you reach exactly zero net worth at your target age. This maximizes your lifetime spending potential.</small>
      <span class="expense-info">Auto-calculated annual expense: {{ formatCurrency(calculatedExpense) }}</span>
    </div>

    <!-- Share Button -->
    <div class="form-group">
      <button 
        type="button" 
        :class="['share-btn', { success: shareSuccess }]" 
        @click="handleShare"
        :disabled="shareButtonDisabled"
        :title="shareButtonDisabled ? 'Enter some financial data to share' : 'Copy secure, encrypted shareable link to clipboard'"
      >
        <span class="material-icons share-icon">{{ shareSuccess ? 'check' : 'share' }}</span>
        <span>{{ shareSuccess ? 'Secure Link Copied!' : 'Share Plan' }}</span>
      </button>
    </div>

    <!-- Button removed: calculation is now automatic on input change -->
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, watchEffect, computed } from 'vue';
import { getFinancialProfile } from '../services/api';
import { calculateDisposableIncome } from '../utils/financialPlan';
import { optimizeExpenseToZeroNetWorth } from '../utils/calculations/expenseOptimizer';
import type { FinancialProfile } from '../utils/financialPlan';
import { formatCurrency, formatNumber, parseFormattedNumber, formatPercentage, generateShareableUrl } from '../utils/formatters';
import { setSecureItem, getSecureItem } from '../utils/encryption';
import { getAgePensionAmounts } from '../services/agePensionService';

const emit = defineEmits(['update']);

const props = defineProps<{
  urlParams?: Partial<FinancialProfile>;
}>();

const isLoaded = ref(false);

// Reactive values for the new asset structure
const propertyAssets = ref(0);
const savings = ref(0);
const salary = ref(0);
const expenses = ref(0);
const currentAge = ref(30);
const retireAge = ref(65);
const deathAge = ref(90);
const savingsGrowthRate = ref(0.025); // 2.5% default
const propertyGrowthRate = ref(0.03); // 3% default
const propertyRentalYield = ref(0.033); // 3.3% default (Australian average net return)
const cpiGrowthRate = ref(0.03); // 3% default CPI growth rate
const mortgageBalance = ref(0);
const mortgageRate = ref(0.06); // 6% default
const superannuationBalance = ref(0);
const superannuationRate = ref(0.07); // 7% default

// Add new reactive variables for pension fields
const pensionAmount = ref(0);
const pensionStartAge = ref(67); // Always 67, hardcoded
const partnerPensionAmount = ref(0);
const partnerPensionStartAge = computed(() => partnerAge.value < 67 ? 67 : partnerAge.value);

// Add new reactive variables for partner's age and retirement age
const partnerAge = ref(30);
const partnerRetireAge = ref(65);
const partnerSalary = ref(0);

// Add new reactive variables for age pension calculation
const relationshipStatus = ref<'single' | 'couple'>('single');
const isHomeowner = ref(true);

// Computed properties for calculated pension amounts
const calculatedUserPension = computed(() => {
  if (!isLoaded.value) return 0;
  
  const pensionAmounts = getAgePensionAmounts(
    relationshipStatus.value,
    isHomeowner.value,
    propertyAssets.value,
    savings.value,
    superannuationBalance.value,
    mortgageBalance.value,
    salary.value,
    partnerSalary.value,
    currentAge.value,
    partnerAge.value
  );
  
  return pensionAmounts.userPension;
});

const calculatedPartnerPension = computed(() => {
  if (!isLoaded.value) return 0;
  
  const pensionAmounts = getAgePensionAmounts(
    relationshipStatus.value,
    isHomeowner.value,
    propertyAssets.value,
    savings.value,
    superannuationBalance.value,
    mortgageBalance.value,
    salary.value,
    partnerSalary.value,
    currentAge.value,
    partnerAge.value
  );
  
  return pensionAmounts.partnerPension;
});

// Computed property for current disposable income
const currentDisposableIncome = computed(() => {
  if (!isLoaded.value) return 0;
  
  const profile: FinancialProfile = {
    propertyAssets: propertyAssets.value,
    savings: savings.value,
    mortgageBalance: mortgageBalance.value,
    mortgageRate: mortgageRate.value,
    superannuationBalance: superannuationBalance.value,
    superannuationRate: superannuationRate.value,
    salary: salary.value,
    partnerSalary: partnerSalary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    savingsGrowthRate: savingsGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    propertyRentalYield: propertyRentalYield.value,
    cpiGrowthRate: cpiGrowthRate.value,
    pensionAmount: calculatedUserPension.value,
    pensionStartAge: 67,
    partnerPensionAmount: calculatedPartnerPension.value,
    partnerPensionStartAge: 67,
    partnerAge: partnerAge.value,
    partnerRetireAge: partnerRetireAge.value,
    relationshipStatus: relationshipStatus.value,
    isHomeowner: isHomeowner.value
  };
  
  let disposableIncome = calculateDisposableIncome(profile);
  
  // Subtract mandatory mortgage interest payments from disposable income
  if (mortgageBalance.value > 0) {
    // Calculate net mortgage (mortgage - savings offset, but not less than 0)
    const netMortgage = Math.max(0, mortgageBalance.value - savings.value);
    const annualMortgageInterest = netMortgage * mortgageRate.value;
    disposableIncome = Math.max(0, disposableIncome - annualMortgageInterest);
  }
  
  return disposableIncome;
});

// Computed property for maximum allowable expense (includes disposable income + drawdown from savings)
const maxAllowableExpense = computed(() => {
  if (!isLoaded.value) return 0;
  
  const baseDisposableIncome = currentDisposableIncome.value;
  
  // Calculate how much savings can be drawn down annually until pension age (67)
  const pensionAge = 67;
  const yearsUntilPension = Math.max(0, pensionAge - currentAge.value);
  
  // If already at or past pension age, don't allow savings drawdown for expenses
  if (yearsUntilPension <= 0) return baseDisposableIncome;
  
  // Allow drawing down savings over years until pension age
  // Use net savings (savings minus mortgage offset effect already considered in disposable income calculation)
  let availableSavings = savings.value;
  
  // If there's a mortgage, savings may be used as offset, reducing the effective available savings
  if (mortgageBalance.value > 0) {
    // The savings offset benefit is already captured in disposable income through reduced mortgage interest
    // So we can use the full savings amount for expense calculation
    availableSavings = savings.value;
  }
  
  const annualSavingsDrawdown = availableSavings > 0 ? availableSavings / yearsUntilPension : 0;
  
  return baseDisposableIncome + annualSavingsDrawdown;
});

// Checkbox for zero net worth at death
const zeroNetWorthAtDeath = ref(false);
const calculatedExpense = ref(0);

// Share functionality
const shareSuccess = ref(false);
// Track when expenses were automatically capped
const expenseWasCapped = ref(false);
const shareButtonDisabled = computed(() => {
  // Button is disabled if no meaningful data is entered
  return currentAge.value <= 18 && 
         salary.value <= 0 && 
         savings.value <= 0 && 
         propertyAssets.value <= 0 && 
         superannuationBalance.value <= 0;
});

// Detect when expenses exceed disposable income (show warning)
const expensesExceedDisposableIncome = computed(() => {
  return !zeroNetWorthAtDeath.value && 
         expenses.value > currentDisposableIncome.value && 
         currentDisposableIncome.value > 0 && 
         isLoaded.value;
});

// Detect when expenses exceed maximum allowable (includes savings drawdown)
const expensesExceedMaxAllowable = computed(() => {
  return !zeroNetWorthAtDeath.value && 
         expenses.value > maxAllowableExpense.value && 
         maxAllowableExpense.value > 0 && 
         isLoaded.value;
});

// Formatted string representations for display
const propertyAssetsFormatted = ref('0');
const savingsFormatted = ref('0');
const salaryFormatted = ref('0');
const expensesFormatted = ref('0');
const currentAgeFormatted = ref('30');
const retireAgeFormatted = ref('65');
const deathAgeFormatted = ref('90');
const savingsGrowthRateFormatted = ref('2.5');
const propertyGrowthRateFormatted = ref('3');
const propertyRentalYieldFormatted = ref('3.3');
const cpiGrowthRateFormatted = ref('3');
const pensionAmountFormatted = ref('0');
const partnerPensionAmountFormatted = ref('0');
const partnerAgeFormatted = ref('30');
const partnerRetireAgeFormatted = ref('65');
const partnerSalaryFormatted = ref('0');
const mortgageBalanceFormatted = ref('0');
const mortgageRateFormatted = ref('6');
const superannuationBalanceFormatted = ref('0');
const superannuationRateFormatted = ref('7');

// Track which fields are currently focused
const focusedFields = ref(new Set<string>());

// Continuous adjustment state
const continuousAdjustmentState = ref<{
  interval: number | null;
  timeout: number | null;
  fieldName: string | null;
  adjustment: number;
}>({
  interval: null,
  timeout: null,
  fieldName: null,
  adjustment: 0
});

// Collapsible section state
const sectionOpen = ref({
  profile: true,
  assets: false,
  income: false,
  advanced: false
});

function toggleSection(section: 'profile' | 'assets' | 'income' | 'advanced') {
  // Close all sections first
  sectionOpen.value.profile = false;
  sectionOpen.value.assets = false;
  sectionOpen.value.income = false;
  sectionOpen.value.advanced = false;
  
  // Open the clicked section
  sectionOpen.value[section] = true;
}


// Field validation tracking
const touchedFields = ref(new Set<string>());

function isFieldTouched(fieldName: string): boolean {
  return touchedFields.value.has(fieldName);
}

function getFieldValue(fieldName: string): any {
  switch (fieldName) {
    case 'currentAge': return currentAge.value;
    case 'retireAge': return retireAge.value;
    case 'relationshipStatus': return relationshipStatus.value;
    case 'propertyAssets': return propertyAssets.value;
    case 'savings': return savings.value;
    case 'superannuationBalance': return superannuationBalance.value;
    case 'salary': return salary.value;
    case 'expenses': return expenses.value;
    case 'deathAge': return deathAge.value;
    case 'propertyGrowthRate': return propertyGrowthRate.value;
    case 'savingsGrowthRate': return savingsGrowthRate.value;
    case 'mortgageBalance': return mortgageBalance.value;
    case 'mortgageRate': return mortgageRate.value;
    case 'superannuationRate': return superannuationRate.value;
    case 'cpiGrowthRate': return cpiGrowthRate.value;
    default: return null;
  }
}

function isFieldValid(fieldName: string): boolean {
  const value = getFieldValue(fieldName);
  
  switch (fieldName) {
    case 'currentAge':
      return typeof value === 'number' && value >= 18 && value <= 100;
    case 'retireAge':
      return typeof value === 'number' && value >= currentAge.value && value <= 100;
    case 'deathAge':
      return typeof value === 'number' && value >= retireAge.value && value <= 120;
    case 'propertyAssets':
    case 'savings':
    case 'superannuationBalance':
    case 'salary':
    case 'mortgageBalance':
      return typeof value === 'number' && value >= 0;
    case 'expenses':
      // Expenses must be >= 0 (allow higher amounts for simulation)
      return typeof value === 'number' && value >= 0;
    case 'relationshipStatus':
      return value === 'single' || value === 'couple';
    case 'propertyGrowthRate':
    case 'savingsGrowthRate':
    case 'mortgageRate':
    case 'superannuationRate':
    case 'cpiGrowthRate':
      return typeof value === 'number' && value >= 0 && value <= 1;
    default:
      return true;
  }
}

// Parse numeric value from formatted string
function parseNumericValue(value: string): number {
  // Remove commas, dollar signs, and other non-numeric characters except decimal point
  const cleaned = value.replace(/[,$%]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Parse percentage value and convert to decimal
function parsePercentageValue(value: string): number {
  const cleaned = value.replace(/[,%]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed / 100;
}

// Update formatted strings when numeric values change
watch(propertyAssets, (newValue) => {
  if (!focusedFields.value.has('propertyAssets')) {
    propertyAssetsFormatted.value = formatCurrency(newValue);
  }
});

watch(savings, (newValue) => {
  if (!focusedFields.value.has('savings')) {
    savingsFormatted.value = formatCurrency(newValue);
  }
});

watch(salary, (newValue) => {
  if (!focusedFields.value.has('salary')) {
    salaryFormatted.value = formatCurrency(newValue);
  }
});

watch(expenses, (newValue) => {
  if (!focusedFields.value.has('expenses')) {
    expensesFormatted.value = formatCurrency(newValue);
  }
});

watch(currentAge, (newValue) => {
  if (!focusedFields.value.has('currentAge')) {
    currentAgeFormatted.value = formatNumber(newValue);
  }
});

watch(retireAge, (newValue) => {
  if (!focusedFields.value.has('retireAge')) {
    retireAgeFormatted.value = formatNumber(newValue);
  }
});

watch(deathAge, (newValue) => {
  if (!focusedFields.value.has('deathAge')) {
    deathAgeFormatted.value = formatNumber(newValue);
  }
});

watch(savingsGrowthRate, (newValue) => {
  if (!focusedFields.value.has('savingsGrowthRate')) {
    savingsGrowthRateFormatted.value = formatPercentage(newValue);
  }
});

watch(propertyGrowthRate, (newValue) => {
  if (!focusedFields.value.has('propertyGrowthRate')) {
    propertyGrowthRateFormatted.value = formatPercentage(newValue);
  }
});

watch(propertyRentalYield, (newValue) => {
  if (!focusedFields.value.has('propertyRentalYield')) {
    propertyRentalYieldFormatted.value = formatPercentage(newValue);
  }
});

watch(cpiGrowthRate, (newValue) => {
  if (!focusedFields.value.has('cpiGrowthRate')) {
    cpiGrowthRateFormatted.value = formatPercentage(newValue);
  }
});

watch(partnerAge, (newValue) => {
  if (!focusedFields.value.has('partnerAge')) {
    partnerAgeFormatted.value = formatNumber(newValue);
  }
});

watch(partnerRetireAge, (newValue) => {
  if (!focusedFields.value.has('partnerRetireAge')) {
    partnerRetireAgeFormatted.value = formatNumber(newValue);
  }
});

watch(mortgageBalance, (newValue) => {
  if (!focusedFields.value.has('mortgageBalance')) {
    mortgageBalanceFormatted.value = formatCurrency(newValue);
  }
});

watch(mortgageRate, (newValue) => {
  if (!focusedFields.value.has('mortgageRate')) {
    mortgageRateFormatted.value = formatPercentage(newValue);
  }
});

watch(superannuationBalance, (newValue) => {
  if (!focusedFields.value.has('superannuationBalance')) {
    superannuationBalanceFormatted.value = formatCurrency(newValue);
  }
});

watch(superannuationRate, (newValue) => {
  if (!focusedFields.value.has('superannuationRate')) {
    superannuationRateFormatted.value = formatPercentage(newValue);
  }
});

watch(pensionAmount, (newValue) => {
  if (!focusedFields.value.has('pensionAmount')) {
    pensionAmountFormatted.value = formatCurrency(newValue);
  }
});

watch(partnerPensionAmount, (newValue) => {
  if (!focusedFields.value.has('partnerPensionAmount')) {
    partnerPensionAmountFormatted.value = formatCurrency(newValue);
  }
});

watch(partnerSalary, (newValue) => {
  if (!focusedFields.value.has('partnerSalary')) {
    partnerSalaryFormatted.value = formatCurrency(newValue);
  }
});

// Extend onFocus/onBlur to handle new pension fields
function onFocus(fieldName: string, event?: Event) {
  focusedFields.value.add(fieldName);
  
  // Select all text when input is focused
  if (event?.target && event.target instanceof HTMLInputElement) {
    // Use setTimeout to ensure the selection happens after the focus event
    setTimeout(() => {
      (event.target as HTMLInputElement).select();
    }, 0);
  }
  
  switch (fieldName) {
    case 'propertyAssets':
      propertyAssetsFormatted.value = propertyAssets.value.toString();
      break;
    case 'savings':
      savingsFormatted.value = savings.value.toString();
      break;
    case 'salary':
      salaryFormatted.value = salary.value.toString();
      break;
    case 'expenses':
      expensesFormatted.value = expenses.value.toString();
      break;
    case 'currentAge':
      currentAgeFormatted.value = currentAge.value.toString();
      break;
    case 'retireAge':
      retireAgeFormatted.value = retireAge.value.toString();
      break;
    case 'deathAge':
      deathAgeFormatted.value = deathAge.value.toString();
      break;
    case 'savingsGrowthRate':
      savingsGrowthRateFormatted.value = formatPercentage(savingsGrowthRate.value);
      break;
    case 'propertyGrowthRate':
      propertyGrowthRateFormatted.value = formatPercentage(propertyGrowthRate.value);
      break;
    case 'propertyRentalYield':
      propertyRentalYieldFormatted.value = formatPercentage(propertyRentalYield.value);
      break;
    case 'cpiGrowthRate':
      cpiGrowthRateFormatted.value = formatPercentage(cpiGrowthRate.value);
      break;
    case 'pensionAmount':
      pensionAmountFormatted.value = pensionAmount.value.toString();
      break;
    case 'partnerPensionAmount':
      partnerPensionAmountFormatted.value = partnerPensionAmount.value.toString();
      break;
    case 'partnerAge':
      partnerAgeFormatted.value = partnerAge.value.toString();
      break;
    case 'partnerRetireAge':
      partnerRetireAgeFormatted.value = partnerRetireAge.value.toString();
      break;
    case 'partnerSalary':
      partnerSalaryFormatted.value = partnerSalary.value.toString();
      break;
    case 'mortgageBalance':
      mortgageBalanceFormatted.value = mortgageBalance.value.toString();
      break;
    case 'mortgageRate':
      mortgageRateFormatted.value = formatPercentage(mortgageRate.value);
      break;
    case 'superannuationBalance':
      superannuationBalanceFormatted.value = superannuationBalance.value.toString();
      break;
    case 'superannuationRate':
      superannuationRateFormatted.value = formatPercentage(superannuationRate.value);
      break;
  }
}
function onBlur(fieldName: string) {
  focusedFields.value.delete(fieldName);
  touchedFields.value.add(fieldName);
  switch (fieldName) {
    case 'propertyAssets':
      const parsedPropertyAssets = parseFormattedNumber(propertyAssetsFormatted.value)
      propertyAssets.value = parsedPropertyAssets >= 0 ? parsedPropertyAssets : 0
      propertyAssetsFormatted.value = formatCurrency(propertyAssets.value)
      break;
    case 'savings':
      const parsedFinancialAssets = parseFormattedNumber(savingsFormatted.value)
      savings.value = parsedFinancialAssets >= 0 ? parsedFinancialAssets : 0
      savingsFormatted.value = formatCurrency(savings.value)
      break;
    case 'salary':
      const parsedSalary = parseFormattedNumber(salaryFormatted.value)
      salary.value = parsedSalary >= 0 ? parsedSalary : 0
      salaryFormatted.value = formatCurrency(salary.value)
      // Reset expense capping flag when salary changes as disposable income may have changed
      expenseWasCapped.value = false;
      break;
    case 'expenses':
      const parsedExpenses = parseFormattedNumber(expensesFormatted.value);
      const validatedExpenses = parsedExpenses >= 0 ? parsedExpenses : 0;
      // Allow any valid expense amount (don't cap automatically)
      expenses.value = validatedExpenses;
      expenseWasCapped.value = false;
      expensesFormatted.value = formatCurrency(expenses.value);
      break;
    case 'currentAge':
      currentAge.value = parseNumericValue(currentAgeFormatted.value);
      currentAgeFormatted.value = formatNumber(currentAge.value);
      break;
    case 'retireAge':
      retireAge.value = parseNumericValue(retireAgeFormatted.value);
      retireAgeFormatted.value = formatNumber(retireAge.value);
      break;
    case 'deathAge':
      deathAge.value = parseNumericValue(deathAgeFormatted.value);
      deathAgeFormatted.value = formatNumber(deathAge.value);
      break;
    case 'savingsGrowthRate':
      savingsGrowthRate.value = parsePercentageValue(savingsGrowthRateFormatted.value);
      savingsGrowthRateFormatted.value = formatPercentage(savingsGrowthRate.value);
      break;
    case 'propertyGrowthRate':
      propertyGrowthRate.value = parsePercentageValue(propertyGrowthRateFormatted.value);
      propertyGrowthRateFormatted.value = formatPercentage(propertyGrowthRate.value);
      break;
    case 'propertyRentalYield':
      propertyRentalYield.value = parsePercentageValue(propertyRentalYieldFormatted.value);
      propertyRentalYieldFormatted.value = formatPercentage(propertyRentalYield.value);
      break;
    case 'cpiGrowthRate':
      cpiGrowthRate.value = parsePercentageValue(cpiGrowthRateFormatted.value);
      cpiGrowthRateFormatted.value = formatPercentage(cpiGrowthRate.value);
      break;
    case 'pensionAmount':
      const parsedPensionAmount = parseFormattedNumber(pensionAmountFormatted.value)
      pensionAmount.value = parsedPensionAmount >= 0 ? parsedPensionAmount : 0
      pensionAmountFormatted.value = formatCurrency(pensionAmount.value)
      break;
    case 'partnerPensionAmount':
      const parsedPartnerPensionAmount = parseFormattedNumber(partnerPensionAmountFormatted.value)
      partnerPensionAmount.value = parsedPartnerPensionAmount >= 0 ? parsedPartnerPensionAmount : 0
      partnerPensionAmountFormatted.value = formatCurrency(partnerPensionAmount.value)
      break;
    case 'partnerAge':
      partnerAge.value = parseNumericValue(partnerAgeFormatted.value);
      partnerAgeFormatted.value = formatNumber(partnerAge.value);
      break;
    case 'partnerRetireAge':
      partnerRetireAge.value = parseNumericValue(partnerRetireAgeFormatted.value);
      partnerRetireAgeFormatted.value = formatNumber(partnerRetireAge.value);
      break;
    case 'partnerSalary':
      const parsedPartnerSalary = parseFormattedNumber(partnerSalaryFormatted.value)
      partnerSalary.value = parsedPartnerSalary >= 0 ? parsedPartnerSalary : 0
      partnerSalaryFormatted.value = formatCurrency(partnerSalary.value)
      // Reset expense capping flag when partner salary changes as disposable income may have changed
      expenseWasCapped.value = false;
      break;
    case 'mortgageBalance':
      const parsedMortgageBalance = parseFormattedNumber(mortgageBalanceFormatted.value)
      mortgageBalance.value = parsedMortgageBalance >= 0 ? parsedMortgageBalance : 0
      mortgageBalanceFormatted.value = formatCurrency(mortgageBalance.value)
      break;
    case 'mortgageRate':
      mortgageRate.value = parsePercentageValue(mortgageRateFormatted.value);
      mortgageRateFormatted.value = formatPercentage(mortgageRate.value);
      break;
    case 'superannuationBalance':
      const parsedSuperannuationBalance = parseFormattedNumber(superannuationBalanceFormatted.value)
      superannuationBalance.value = parsedSuperannuationBalance >= 0 ? parsedSuperannuationBalance : 0
      superannuationBalanceFormatted.value = formatCurrency(superannuationBalance.value)
      break;
    case 'superannuationRate':
      superannuationRate.value = parsePercentageValue(superannuationRateFormatted.value);
      superannuationRateFormatted.value = formatPercentage(superannuationRate.value);
      break;
  }
}

// When Enter is pressed, blur the input to accept value and trigger recalculation
function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target) {
    target.blur();
  }
}

// Adjust value with increment/decrement buttons
function adjustValue(fieldName: string, adjustment: number) {
  switch (fieldName) {
    case 'currentAge':
      currentAge.value = Math.max(0, currentAge.value + adjustment);
      break;
    case 'partnerAge':
      partnerAge.value = Math.max(0, partnerAge.value + adjustment);
      break;
    case 'retireAge':
      retireAge.value = Math.max(0, retireAge.value + adjustment);
      break;
    case 'partnerRetireAge':
      partnerRetireAge.value = Math.max(0, partnerRetireAge.value + adjustment);
      break;
    case 'deathAge':
      deathAge.value = Math.max(0, deathAge.value + adjustment);
      break;
    case 'propertyAssets':
      propertyAssets.value = Math.max(0, propertyAssets.value + adjustment);
      break;
    case 'savings':
      savings.value = Math.max(0, savings.value + adjustment);
      break;
    case 'savingsGrowthRate':
      savingsGrowthRate.value = Math.max(0, Math.min(1, savingsGrowthRate.value + adjustment / 100));
      break;
    case 'propertyGrowthRate':
      propertyGrowthRate.value = Math.max(0, Math.min(1, propertyGrowthRate.value + adjustment / 100));
      break;
    case 'propertyRentalYield':
      propertyRentalYield.value = Math.max(0, Math.min(1, propertyRentalYield.value + adjustment / 100));
      break;
    case 'cpiGrowthRate':
      cpiGrowthRate.value = Math.max(0, Math.min(1, cpiGrowthRate.value + adjustment / 100));
      break;
    case 'salary':
      salary.value = Math.max(0, salary.value + adjustment);
      break;
    case 'partnerSalary':
      partnerSalary.value = Math.max(0, partnerSalary.value + adjustment);
      break;
    case 'expenses':
      if (!zeroNetWorthAtDeath.value) {
        const newValue = expenses.value + adjustment;
        expenses.value = Math.max(0, newValue);
      }
      break;
    case 'pensionAmount':
      pensionAmount.value = Math.max(0, pensionAmount.value + adjustment);
      break;
    case 'partnerPensionAmount':
      partnerPensionAmount.value = Math.max(0, partnerPensionAmount.value + adjustment);
      break;
    case 'mortgageBalance':
      mortgageBalance.value = Math.max(0, mortgageBalance.value + adjustment);
      break;
    case 'mortgageRate':
      mortgageRate.value = Math.max(0, Math.min(1, mortgageRate.value + adjustment / 100));
      break;
    case 'superannuationBalance':
      superannuationBalance.value = Math.max(0, superannuationBalance.value + adjustment);
      break;
    case 'superannuationRate':
      superannuationRate.value = Math.max(0, Math.min(1, superannuationRate.value + adjustment / 100));
      break;
  }
}

// Continuous adjustment functions
function startContinuousAdjustment(fieldName: string, adjustment: number) {
  // Clear any existing interval and timeout
  stopContinuousAdjustment();
  
  // Store the current adjustment state
  continuousAdjustmentState.value.fieldName = fieldName;
  continuousAdjustmentState.value.adjustment = adjustment;
  
  // Start with initial delay, then faster intervals
  const initialDelay = 500; // 500ms before starting continuous
  const fastInterval = 100; // 100ms between adjustments
  
  continuousAdjustmentState.value.timeout = window.setTimeout(() => {
    if (continuousAdjustmentState.value.fieldName === fieldName) {
      continuousAdjustmentState.value.interval = window.setInterval(() => {
        adjustValue(fieldName, adjustment);
      }, fastInterval);
    }
  }, initialDelay);
}

function stopContinuousAdjustment() {
  if (continuousAdjustmentState.value.interval) {
    clearInterval(continuousAdjustmentState.value.interval);
    continuousAdjustmentState.value.interval = null;
  }
  if (continuousAdjustmentState.value.timeout) {
    clearTimeout(continuousAdjustmentState.value.timeout);
    continuousAdjustmentState.value.timeout = null;
  }
  continuousAdjustmentState.value.fieldName = null;
  continuousAdjustmentState.value.adjustment = 0;
}

// Watch for checkbox and recalculate
watch(zeroNetWorthAtDeath, (checked) => {
  // Clear expense capping flag when auto-optimize toggle changes
  expenseWasCapped.value = false;
  
  if (checked) {
    const profile: FinancialProfile = {
      propertyAssets: propertyAssets.value,
      savings: savings.value,
      mortgageBalance: mortgageBalance.value,
      mortgageRate: mortgageRate.value,
      superannuationBalance: superannuationBalance.value,
      superannuationRate: superannuationRate.value,
      salary: salary.value,
      partnerSalary: partnerSalary.value,
      expenses: expenses.value,
      currentAge: currentAge.value,
      retireAge: retireAge.value,
      deathAge: deathAge.value,
      savingsGrowthRate: savingsGrowthRate.value,
      propertyGrowthRate: propertyGrowthRate.value,
      propertyRentalYield: propertyRentalYield.value,
      cpiGrowthRate: cpiGrowthRate.value,
      pensionAmount: calculatedUserPension.value,
      pensionStartAge: 67, // hardcoded
      partnerPensionAmount: calculatedPartnerPension.value,
      partnerPensionStartAge: 67, // Always 67 for Australian age pension
      partnerAge: partnerAge.value,
      partnerRetireAge: partnerRetireAge.value,
      relationshipStatus: relationshipStatus.value,
      isHomeowner: isHomeowner.value
    };
    const optimizationResult = optimizeExpenseToZeroNetWorth(profile);
    calculatedExpense.value = optimizationResult.optimalExpense;
    expenses.value = calculatedExpense.value;
    expensesFormatted.value = formatCurrency(calculatedExpense.value);
  }
});

// If user changes any relevant field and box is checked, recalculate
watch([
  propertyAssets, savings, salary, partnerSalary, currentAge, retireAge, deathAge,
  savingsGrowthRate, propertyGrowthRate, cpiGrowthRate,
  pensionAmount, partnerPensionAmount, partnerPensionStartAge,
  partnerAge, partnerRetireAge, mortgageBalance, mortgageRate,
  superannuationBalance, superannuationRate, relationshipStatus, isHomeowner
], () => {
  if (zeroNetWorthAtDeath.value) {
    const profile: FinancialProfile = {
      propertyAssets: propertyAssets.value,
      savings: savings.value,
      mortgageBalance: mortgageBalance.value,
      mortgageRate: mortgageRate.value,
      superannuationBalance: superannuationBalance.value,
      superannuationRate: superannuationRate.value,
      salary: salary.value,
      partnerSalary: partnerSalary.value,
      expenses: expenses.value,
      currentAge: currentAge.value,
      retireAge: retireAge.value,
      deathAge: deathAge.value,
      savingsGrowthRate: savingsGrowthRate.value,
      propertyGrowthRate: propertyGrowthRate.value,
      propertyRentalYield: propertyRentalYield.value,
      cpiGrowthRate: cpiGrowthRate.value,
      pensionAmount: calculatedUserPension.value,
      pensionStartAge: 67, // hardcoded
      partnerPensionAmount: calculatedPartnerPension.value,
      partnerPensionStartAge: 67, // Always 67 for Australian age pension
      partnerAge: partnerAge.value,
      partnerRetireAge: partnerRetireAge.value,
      relationshipStatus: relationshipStatus.value,
      isHomeowner: isHomeowner.value
    };
    const optimizationResult = optimizeExpenseToZeroNetWorth(profile);
    calculatedExpense.value = optimizationResult.optimalExpense;
    expenses.value = calculatedExpense.value;
    expensesFormatted.value = formatCurrency(calculatedExpense.value);
  }
});

// Emit updated profile automatically on any input change
watchEffect(() => {
  if (!isLoaded.value) return;

  const profile: FinancialProfile = {
    propertyAssets: propertyAssets.value,
    savings: savings.value,
    mortgageBalance: mortgageBalance.value,
    mortgageRate: mortgageRate.value,
    superannuationBalance: superannuationBalance.value,
    superannuationRate: superannuationRate.value,
    salary: salary.value,
    partnerSalary: partnerSalary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    savingsGrowthRate: savingsGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    propertyRentalYield: propertyRentalYield.value,
    cpiGrowthRate: cpiGrowthRate.value,
    pensionAmount: calculatedUserPension.value,
    pensionStartAge: 67, // hardcoded
    partnerPensionAmount: calculatedPartnerPension.value,
    partnerPensionStartAge: 67, // Always 67 for Australian age pension
    partnerAge: partnerAge.value,
    partnerRetireAge: partnerRetireAge.value,
    relationshipStatus: relationshipStatus.value,
    isHomeowner: isHomeowner.value
  };

  saveToLocalStorage(); // Save changes to local storage immediately
  emit('update', profile);

  // Auto-save to backend
  // updateFinancialProfile(profile).catch((e) => {
  //   console.error('Failed to save profile to backend:', e);
  // });
});

const LOCAL_KEY = 'financial-input';

// Type definition for stored financial data
interface StoredFinancialData {
  propertyAssets?: number;
  savings?: number;
  mortgageBalance?: number;
  mortgageRate?: number;
  superannuationBalance?: number;
  superannuationRate?: number;
  salary?: number;
  partnerSalary?: number;
  expenses?: number;
  currentAge?: number;
  retireAge?: number;
  deathAge?: number;
  savingsGrowthRate?: number;
  propertyGrowthRate?: number;
  propertyRentalYield?: number;
  cpiGrowthRate?: number;
  inflationRate?: number; // Legacy field
  pensionAmount?: number;
  pensionStartAge?: number;
  partnerPensionAmount?: number;
  partnerAge?: number;
  partnerRetireAge?: number;
  relationshipStatus?: string;
  isHomeowner?: boolean;
}

function saveToLocalStorage() {
  const data = {
    propertyAssets: propertyAssets.value,
    savings: savings.value,
    mortgageBalance: mortgageBalance.value,
    mortgageRate: mortgageRate.value,
    superannuationBalance: superannuationBalance.value,
    superannuationRate: superannuationRate.value,
    salary: salary.value,
    partnerSalary: partnerSalary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    savingsGrowthRate: savingsGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    propertyRentalYield: propertyRentalYield.value,
    cpiGrowthRate: cpiGrowthRate.value,
    pensionAmount: pensionAmount.value,
    pensionStartAge: 67, // hardcoded
    partnerPensionAmount: partnerPensionAmount.value,
    partnerAge: partnerAge.value,
    partnerRetireAge: partnerRetireAge.value,
    relationshipStatus: relationshipStatus.value,
    isHomeowner: isHomeowner.value
  };
  // Use encrypted storage for sensitive financial data
  setSecureItem(LOCAL_KEY, data);
}

function loadFromLocalStorage() {
  // Use secure decryption for sensitive financial data
  const parsed = getSecureItem<StoredFinancialData>(LOCAL_KEY);
  if (parsed) {
    try {
      propertyAssets.value = parsed.propertyAssets ?? 0;
      savings.value = parsed.savings ?? 0;
      mortgageBalance.value = parsed.mortgageBalance ?? 0;
      mortgageRate.value = parsed.mortgageRate ?? 0.06;
      superannuationBalance.value = parsed.superannuationBalance ?? 0;
      superannuationRate.value = parsed.superannuationRate ?? 0.07;
      salary.value = parsed.salary ?? 0;
      partnerSalary.value = parsed.partnerSalary ?? 0;
      expenses.value = parsed.expenses ?? 0;
      currentAge.value = parsed.currentAge ?? 30;
      retireAge.value = parsed.retireAge ?? 65;
      deathAge.value = parsed.deathAge ?? 90;
      savingsGrowthRate.value = parsed.savingsGrowthRate ?? 0.025;
      propertyGrowthRate.value = parsed.propertyGrowthRate ?? 0.03;
      propertyRentalYield.value = parsed.propertyRentalYield ?? 0.033;
      cpiGrowthRate.value = parsed.cpiGrowthRate ?? parsed.inflationRate ?? 0.03;
      pensionAmount.value = parsed.pensionAmount ?? 0;
      pensionStartAge.value = 67; // always 67
      partnerPensionAmount.value = parsed.partnerPensionAmount ?? 0;
      partnerAge.value = parsed.partnerAge ?? 30;
      partnerRetireAge.value = parsed.partnerRetireAge ?? 65;
      relationshipStatus.value = (parsed.relationshipStatus as 'single' | 'couple') ?? 'single';
      isHomeowner.value = parsed.isHomeowner ?? true;
      
      // Update formatted values
      updateFormattedValues();
    } catch (error) {
      console.warn('Failed to load financial data from storage:', error);
    }
  }
}

// Function to update all formatted values
function updateFormattedValues() {
  propertyAssetsFormatted.value = formatCurrency(propertyAssets.value);
  savingsFormatted.value = formatCurrency(savings.value);
  mortgageBalanceFormatted.value = formatCurrency(mortgageBalance.value);
  mortgageRateFormatted.value = formatPercentage(mortgageRate.value);
  superannuationBalanceFormatted.value = formatCurrency(superannuationBalance.value);
  superannuationRateFormatted.value = formatPercentage(superannuationRate.value);
  salaryFormatted.value = formatCurrency(salary.value);
  partnerSalaryFormatted.value = formatCurrency(partnerSalary.value);
  expensesFormatted.value = formatCurrency(expenses.value);
  currentAgeFormatted.value = formatNumber(currentAge.value);
  retireAgeFormatted.value = formatNumber(retireAge.value);
  deathAgeFormatted.value = formatNumber(deathAge.value);
  savingsGrowthRateFormatted.value = formatPercentage(savingsGrowthRate.value);
  propertyGrowthRateFormatted.value = formatPercentage(propertyGrowthRate.value);
  propertyRentalYieldFormatted.value = formatPercentage(propertyRentalYield.value);
  cpiGrowthRateFormatted.value = formatPercentage(cpiGrowthRate.value);
  pensionAmountFormatted.value = formatCurrency(pensionAmount.value);
  partnerPensionAmountFormatted.value = formatCurrency(partnerPensionAmount.value);
  partnerAgeFormatted.value = formatNumber(partnerAge.value);
  partnerRetireAgeFormatted.value = formatNumber(partnerRetireAge.value);
}

async function load() {
  // Step 1: Load from encrypted localStorage or API (existing behavior)
  const localData = getSecureItem<StoredFinancialData>(LOCAL_KEY);
  if (localData) {
    loadFromLocalStorage();
  } else {
    try {
      const profile = await getFinancialProfile();
      if (profile) {
        propertyAssets.value = profile.propertyAssets || 0;
        savings.value = profile.savings || 0;
        mortgageBalance.value = profile.mortgageBalance || 0;
        mortgageRate.value = profile.mortgageRate || 0.06;
        superannuationBalance.value = profile.superannuationBalance || 0;
        superannuationRate.value = profile.superannuationRate || 0.07;
        salary.value = profile.salary || 0;
        partnerSalary.value = profile.partnerSalary || 0;
        expenses.value = profile.expenses || 0;
        currentAge.value = profile.currentAge || 30;
        retireAge.value = profile.retireAge || 65;
        deathAge.value = profile.deathAge || 90;
        savingsGrowthRate.value = profile.savingsGrowthRate || 0.025;
        propertyGrowthRate.value = profile.propertyGrowthRate || 0.03;
        propertyRentalYield.value = profile.propertyRentalYield || 0.033;
        cpiGrowthRate.value = profile.cpiGrowthRate || profile.inflationRate || 0.03;
        pensionAmount.value = profile.pensionAmount || 0;
        pensionStartAge.value = 67; // always 67
        partnerPensionAmount.value = profile.partnerPensionAmount || 0;
        partnerAge.value = profile.partnerAge || 30;
        partnerRetireAge.value = profile.partnerRetireAge || 65;
        relationshipStatus.value = profile.relationshipStatus || 'single';
        isHomeowner.value = profile.isHomeowner ?? true;
        updateFormattedValues();
        saveToLocalStorage();
      }
    } catch (error) {
      console.log('No existing profile found, using defaults');
    }
  }
  
  // Step 2: Override with URL parameters if provided (highest priority)
  if (props.urlParams && Object.keys(props.urlParams).length > 0) {
    applyUrlParameters();
  }
  
  isLoaded.value = true;
}

function applyUrlParameters() {
  if (!props.urlParams) return;
  
  // Override values with URL parameters when they exist
  if (props.urlParams.currentAge !== undefined) currentAge.value = props.urlParams.currentAge;
  if (props.urlParams.retireAge !== undefined) retireAge.value = props.urlParams.retireAge;
  if (props.urlParams.superannuationBalance !== undefined) superannuationBalance.value = props.urlParams.superannuationBalance;
  if (props.urlParams.salary !== undefined) salary.value = props.urlParams.salary;
  if (props.urlParams.expenses !== undefined) expenses.value = props.urlParams.expenses;
  if (props.urlParams.propertyAssets !== undefined) propertyAssets.value = props.urlParams.propertyAssets;
  if (props.urlParams.partnerAge !== undefined) partnerAge.value = props.urlParams.partnerAge;
  if (props.urlParams.partnerRetireAge !== undefined) partnerRetireAge.value = props.urlParams.partnerRetireAge;
  if (props.urlParams.savings !== undefined) savings.value = props.urlParams.savings;
  if (props.urlParams.mortgageBalance !== undefined) mortgageBalance.value = props.urlParams.mortgageBalance;
  if (props.urlParams.partnerSalary !== undefined) partnerSalary.value = props.urlParams.partnerSalary;
  if (props.urlParams.relationshipStatus !== undefined) relationshipStatus.value = props.urlParams.relationshipStatus;
  
  // Update formatted values and save to localStorage
  updateFormattedValues();
  saveToLocalStorage();
  
  // The watchEffect will automatically trigger the calculation when values are updated
}

// Handle share functionality
async function handleShare() {
  if (shareButtonDisabled.value) return;
  
  try {
    // Build current profile
    const profile: FinancialProfile = {
      propertyAssets: propertyAssets.value,
      savings: savings.value,
      mortgageBalance: mortgageBalance.value,
      mortgageRate: mortgageRate.value,
      superannuationBalance: superannuationBalance.value,
      superannuationRate: superannuationRate.value,
      salary: salary.value,
      partnerSalary: partnerSalary.value,
      expenses: expenses.value,
      currentAge: currentAge.value,
      retireAge: retireAge.value,
      deathAge: deathAge.value,
      savingsGrowthRate: savingsGrowthRate.value,
      propertyGrowthRate: propertyGrowthRate.value,
      propertyRentalYield: propertyRentalYield.value,
      cpiGrowthRate: cpiGrowthRate.value,
      pensionAmount: calculatedUserPension.value,
      pensionStartAge: 67,
      partnerPensionAmount: calculatedPartnerPension.value,
      partnerPensionStartAge: 67,
      partnerAge: partnerAge.value,
      partnerRetireAge: partnerRetireAge.value,
      relationshipStatus: relationshipStatus.value,
      isHomeowner: isHomeowner.value
    };
    
    // Generate secure shareable URL (encrypted by default)
    const shareableUrl = generateShareableUrl(profile);
    
    // Copy to clipboard
    await navigator.clipboard.writeText(shareableUrl);
    
    // Show success feedback with security information
    shareSuccess.value = true;
    setTimeout(() => {
      shareSuccess.value = false;
    }, 3000); // Show longer for security message
    
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback: try to select text manually
    // For now, just log the error - in a real app you might show a toast notification
  }
}


onMounted(() => {
  // Expand 'person profile', close other sections on load
  sectionOpen.value = { profile: true, assets: false, income: false, advanced: false };
  load();
});

// Watch for changes to urlParams prop
watch(() => props.urlParams, (newParams) => {
  if (newParams && Object.keys(newParams).length > 0) {
    applyUrlParameters();
  }
}, { deep: true, immediate: true });

onUnmounted(() => {
  // Clean up any running intervals
  stopContinuousAdjustment();
});
</script>

<style scoped>
.asset-form {
  background: #232733;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}


/* Privacy Notice */
.privacy-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.privacy-icon {
  width: 1rem;
  height: 1rem;
  color: #6ee7b7;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  color: #6ee7b7;
  font-weight: 600;
  font-size: 0.75rem;
}

.input-with-buttons {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
}

.input-with-buttons input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #374151;
  border-left: none;
  border-right: none;
  background: #1f2937;
  color: #e0e3e8;
  font-size: 0.85rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.input-with-buttons.input-valid input {
  border-color: #34d399;
}

.input-with-buttons.input-invalid input {
  border-color: #ef4444;
}

.field-validation-icon {
  position: absolute;
  right: 2.5rem;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}

.field-validation-icon.valid {
  color: #34d399;
}

.validation-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
  line-height: 1.3;
}

.validation-warning {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #f59e0b;
  line-height: 1.3;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #374151;
  border-radius: 6px;
  background: #1f2937;
  color: #e0e3e8;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.increment-btn {
  width: 32px;
  height: 38px;
  background: #374151;
  border: 1px solid #374151;
  color: #e0e3e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  transition: background-color 0.2s;
  user-select: none;
}

.increment-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.increment-btn:last-child {
  border-radius: 0 6px 6px 0;
}

.increment-btn:hover {
  background: #4b5563;
}

.increment-btn:active {
  background: #6b7280;
}

.increment-btn:disabled {
  background: #1f2937;
  color: #6b7280;
  cursor: not-allowed;
  opacity: 0.5;
}

.input-with-buttons input:disabled {
  background: #2d3748;
  color: #e0e3e8;
  cursor: not-allowed;
  border-color: #4a5568;
}

.form-group input:focus {
  outline: none;
  border-color: #6ee7b7;
  box-shadow: 0 0 0 2px rgba(110, 231, 183, 0.2);
}

.formatted-value {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.7rem;
  color: #9ca3af;
  font-style: italic;
}

.help-text {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.65rem;
  color: #6b7280;
  line-height: 1.3;
}

.submit-btn {
  width: 100%;
  padding: 0.6rem 1.2rem;
  background: #6ee7b7;
  color: #1f2937;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #34d399;
}

.submit-btn:active {
  background: #10b981;
}

.share-btn {
  width: 100%;
  padding: 0.6rem 1.2rem;
  background: #374151;
  color: #e0e3e8;
  border: 1px solid #4b5563;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.share-btn:hover:not(:disabled) {
  background: #4b5563;
  border-color: #6ee7b7;
  color: #6ee7b7;
}

.share-btn:active:not(:disabled) {
  background: #6b7280;
  transform: translateY(1px);
}

.share-btn:disabled {
  background: #1f2937;
  color: #6b7280;
  cursor: not-allowed;
  opacity: 0.5;
  border-color: #374151;
}

.share-icon {
  font-size: 1rem;
  transition: color 0.2s ease;
}

.share-btn.success {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.form-section {
  border: 1px solid #374151;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  padding: 1rem 1rem 0.5rem 1rem;
  background: #20232e;
  transition: all 0.2s ease;
}

.form-section.section-active {
  border-color: #6ee7b7;
  box-shadow: 0 0 0 1px rgba(110, 231, 183, 0.1);
}

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6ee7b7;
  margin-bottom: 0.7rem;
  padding: 0 0.5rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.form-section-title.clickable:hover {
  background: #232733;
}
.chevron {
  display: inline-block;
  margin-right: 0.5em;
  transition: transform 0.2s;
}
.chevron {
  transform: rotate(-90deg);
}
.chevron.open {
  transform: rotate(0deg);
}
.checkbox-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.checkbox-group label {
  font-size: 0.9rem;
  color: #e0e3e8;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.checkbox-group input[type="checkbox"] {
  margin-right: 0.5em;
}
.expense-info {
  font-size: 0.8rem;
  color: #6ee7b7;
  margin-top: 0.2em;
}

.label-with-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.label-with-toggle label {
  margin-bottom: 0;
}

.toggle-switch {
  position: relative;
  width: 32px;
  height: 16px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  padding: 0;
  outline: none;
}

.toggle-switch:hover {
  background: #4b5563;
}

.toggle-switch.active {
  background: #6ee7b7;
  border-color: #6ee7b7;
}

.toggle-switch:focus {
  box-shadow: 0 0 0 2px rgba(110, 231, 183, 0.3);
}

.toggle-slider {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #e0e3e8;
  border-radius: 50%;
  transition: transform 0.2s ease;
  transform: translateX(2px);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(18px);
  background: #1f2937;
}

.radio-group {
  display: flex;
  gap: 2rem;
  margin-top: 0.75rem;
  align-items: flex-start;
}

.radio-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: #e0e3e8;
  font-weight: normal;
  margin-bottom: 0;
  margin-right: 1rem;
  min-width: fit-content;
  white-space: nowrap;
}

.radio-label input[type="radio"] {
  margin-right: 0.3rem;
  accent-color: #6ee7b7;
}

.form-group .checkbox-label {
  display: flex !important;
  align-items: center;
  flex-wrap: nowrap;
  cursor: pointer;
  font-size: 0.75rem;
  color: #e0e3e8;
  font-weight: normal;
  margin-bottom: 0.4rem;
}

.form-group .checkbox-label input[type="checkbox"] {
  margin-right: 0.3rem;
  accent-color: #6ee7b7;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.partner-section {
  border-left: 2px solid #374151;
  padding-left: 1rem;
  margin-left: 0.5rem;
}

.pension-display {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.pension-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.pension-item:last-child {
  margin-bottom: 0;
}

.pension-item.total {
  border-top: 1px solid #374151;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

.pension-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.pension-value {
  font-size: 0.75rem;
  color: #6ee7b7;
  font-weight: 600;
}

.pension-item.total .pension-value {
  color: #34d399;
  font-size: 0.8rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .asset-form {
    padding: 0.75rem;
  }
  
  .form-section {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .form-section-title {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .increment-btn {
    width: 40px;
    height: 44px;
    font-size: 1rem;
  }
  
  .input-with-buttons input {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .form-group label {
    font-size: 0.8rem;
  }
  
  .help-text {
    font-size: 0.7rem;
  }
  
  .privacy-notice {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .form-section-title {
    font-size: 0.85rem;
  }
  
  .increment-btn {
    width: 36px;
    height: 40px;
  }
  
  .radio-group {
    flex-direction: row;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }
}

/* iPhone and narrow mobile screens */
@media (max-width: 414px) {
  .asset-form {
    padding: 0.5rem;
    /* Ensure form never exceeds viewport */
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-section {
    padding: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .form-section-title {
    font-size: 0.8rem;
    padding: 0.375rem;
  }
  
  .form-group {
    margin-bottom: 0.75rem;
  }
  
  .input-with-buttons {
    /* Ensure inputs don't overflow */
    max-width: 100%;
    min-width: 0;
  }
  
  .input-with-buttons input {
    padding: 0.625rem 0.375rem;
    font-size: 0.85rem;
    /* Prevent input from expanding beyond container */
    min-width: 0;
    flex: 1;
  }
  
  .increment-btn {
    width: 32px;
    height: 36px;
    font-size: 0.9rem;
    /* Ensure buttons don't cause overflow */
    flex-shrink: 0;
  }
  
  .form-group label {
    font-size: 0.75rem;
    margin-bottom: 0.375rem;
  }
  
  .help-text, .validation-error, .validation-warning {
    font-size: 0.7rem;
  }
  
  /* Extra spacing for radio buttons on very narrow screens */
  .radio-group {
    gap: 2.5rem;
    margin-top: 1rem;
  }
  
  .privacy-notice {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .privacy-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  
  /* Ensure action buttons are properly sized */
  .action-button, .calculate-btn, .reset-btn {
    padding: 0.625rem 1rem;
    font-size: 0.85rem;
    /* Prevent buttons from causing horizontal overflow */
    max-width: 100%;
    box-sizing: border-box;
  }
}

/* iOS Safari/Chrome specific adjustments */
@supports (-webkit-touch-callout: none) {
  .radio-group {
    gap: 2.5rem !important;
    margin-top: 1rem !important;
  }
  
  .radio-label {
    margin-right: 1.5rem !important;
    padding-right: 0.5rem;
  }
  
  /* Force layout recalculation on iOS */
  .radio-group::after {
    content: '';
    display: block;
    clear: both;
    height: 0;
  }
}

/* Additional iOS mobile browser detection */
@media screen and (max-width: 768px) and (-webkit-min-device-pixel-ratio: 2) {
  .radio-group {
    gap: 3rem !important;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
  
  .radio-label {
    flex-shrink: 0;
    margin-right: 2rem !important;
  }
}
</style>