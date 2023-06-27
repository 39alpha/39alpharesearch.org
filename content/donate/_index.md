---
layout: donate
title: Donate
menu:
    main:
        weight: 4
---

# Donate to 39 Alpha Research

Support our work to make scientific research more open and productive.

We ask that if you wish to donate more than $500, please consider [contacting us directly](contact-us).

<div class="flash hidden">
    <p id="amount-too-low" class="flash__content hidden">
        We appreciate your generosity, but unfortunately we cannot process donations less than $1.0 online. Consider increasing your donation or <a href="/contact-us">contact us</a> directly.
    </p>
    <p id="amount-too-high" class="flash__content hidden">
        Your generosity is overwhelming, but unfortunately we cannot process donations above than $500.0 online. We encourage you to <a href="/contact-us">contact us</a> directly for more information on how to contribute to our work.
    </p>
    <p id="unexpected-error" class="flash__content hidden">
        It appears something went wrong processing your donation. If the problem persists, please <a href="/contact-us">let us know</a>.
    </p>
</div>

<form class="form" name="donate" method="POST" action>
    <div class="form__row">
        <div class="form__field">
            <label class="form__label" id="first_name" for="first-name">First Name:</label>
            <input class="form__input" type="text" name="first-name" aria-labelledby="first_name" aria-required="true" required>
        </div>
        <div class="form__field">
            <label class="form__label" id="last_name" for="last-name">Last Name:</label>
            <input class="form__input" type="text" name="last-name" aria-labelledby="last_name" aria-required="true" required>
        </div>
    </div>
    <div class="form__row">
        <div class="form__field">
            <label class="form__label" id="email" for="email">Email:</label>
            <input class="form__input" type="email" name="email" aria-labelledby="email" aria-required="true" required>
        </div>
        <div class="form__field form__field--currency">
            <label class="form__label" id="donation_amount" for="amount">Amount:</label>
            <div class="form__input form__input--currency">
                $<input class="form__input--borderless" type="number" name="amount" step="any" pattern="\d+\.?\d{0,2}" aria-labelledby="donation-amount" aria-required="true" required>
            </div>
        </div>
    </div>
    <div class="form__row">
        <div class="form__field">
            <input class="form__check" type="checkbox" name="compensate" arial-labelledby="compensate" aria-checked checked>
            <label class="form__label form__label--light" id="compensate" for="compensate">
                Yes, I would like to increase my contribution by 2.9% and 30&#162; to cover credit card processing fees.
            </label>
        </div>
    </div>
    <div class="form__row">
        <div class="form__field">
            <button class="form__button" type="submit" aria-label="Donate">Donate</button>
        </div>
    </div>
</form>

<script type="text/javascript" src="/js/donate.js" defer></script>
