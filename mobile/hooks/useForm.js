import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook for form management
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation schema
 * @param {Function} onSubmit - Submit handler
 * @param {Object} options - Configuration options
 * @param {boolean} options.validateOnChange - Validate on change
 * @param {boolean} options.validateOnBlur - Validate on blur
 * @returns {Object} { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue, setFieldTouched, isSubmitting }
 */
const useForm = (
  initialValues = {},
  validationSchema = null,
  onSubmit = null,
  options = {}
) => {
  const { validateOnChange = true, validateOnBlur = true } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    async (fieldName, fieldValue) => {
      if (!validationSchema) return null;

      try {
        // If using a schema validation library like Yup
        if (typeof validationSchema.validateAt === "function") {
          await validationSchema.validateAt(fieldName, {
            [fieldName]: fieldValue,
          });
          return null;
        }
        // If using a custom validation object
        else if (validationSchema[fieldName]) {
          const error = validationSchema[fieldName](fieldValue);
          return error || null;
        }
        return null;
      } catch (error) {
        return error.message || "Invalid value";
      }
    },
    [validationSchema]
  );

  // Validate all fields
  const validateForm = useCallback(
    async (formValues) => {
      if (!validationSchema) return {};

      try {
        // If using a schema validation library like Yup
        if (typeof validationSchema.validate === "function") {
          await validationSchema.validate(formValues, { abortEarly: false });
          return {};
        }

        // If using a custom validation object
        const validationErrors = {};
        for (const [key, validator] of Object.entries(validationSchema)) {
          const error = validator(formValues[key]);
          if (error) {
            validationErrors[key] = error;
          }
        }
        return validationErrors;
      } catch (error) {
        if (error.inner) {
          // Yup validation errors
          const validationErrors = {};
          error.inner.forEach((err) => {
            validationErrors[err.path] = err.message;
          });
          return validationErrors;
        }
        return { _error: error.message || "Validation failed" };
      }
    },
    [validationSchema]
  );

  // Handle field change
  const handleChange = useCallback(
    (fieldName) => (fieldValue) => {
      const newValue = fieldValue !== undefined ? fieldValue : "";
      setValues((prev) => ({
        ...prev,
        [fieldName]: newValue,
      }));

      if (validateOnChange) {
        validateField(fieldName, newValue).then((error) => {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error || undefined,
          }));
        });
      }
    },
    [validateField, validateOnChange]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (fieldName) => () => {
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      if (validateOnBlur && values[fieldName] !== undefined) {
        validateField(fieldName, values[fieldName]).then((error) => {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error || undefined,
          }));
        });
      }
    },
    [validateField, values, validateOnBlur]
  );

  // Set field value
  const setFieldValue = useCallback((fieldName, fieldValue) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((fieldName, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: isTouched,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Validate form
      const validationErrors = await validateForm(values);
      setErrors(validationErrors);

      // Check if there are any errors
      const hasErrors = Object.keys(validationErrors).length > 0;
      if (hasErrors) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error("Submit error:", error);
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateForm, onSubmit]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set multiple values at once
  const setValuesMulti = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Check if form is dirty (values changed from initial)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldTouched,
    setValues: setValuesMulti,
    validateField,
    validateForm,
  };
};

export default useForm;
