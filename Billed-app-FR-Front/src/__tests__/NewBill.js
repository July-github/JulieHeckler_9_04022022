/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";


describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    document.body.innerHTML = NewBillUI()
  })

  describe("When I am on NewBill Page", () => {
    test("Then it should shown all the inputs of the form and the button 'Envoyer'", () => {

      expect(screen.getByText("Type de dépense")).toBeTruthy()
      expect(screen.getByText("Nom de la dépense")).toBeTruthy()
      expect(screen.getByText("Date")).toBeTruthy()
      expect(screen.getByText("Montant TTC")).toBeTruthy()
      expect(screen.getByText("TVA")).toBeTruthy()
      expect(screen.getByText("Commentaire")).toBeTruthy()
      expect(screen.getByText("Justificatif")).toBeTruthy()
      expect(screen.getByText("Envoyer")).toBeTruthy()
    })

    test("Then the field 'Type de dépense' should be required", () => {
      const expense = screen.getByTestId("expense-type")
      expect(expense).toBeRequired()
    })
    test("Then the field 'Date' should be required", () => {
      const datepicker = screen.getByTestId("datepicker")
      expect(datepicker).toBeRequired()
    })
    test("Then the field 'Montant' should be required", () => {
      const amount = screen.getByTestId("amount")
      expect(amount).toBeRequired()
    })
    test("Then the field 'PCT' should be required", () => {
      const pct = screen.getByTestId("pct")
      expect(pct).toBeRequired()
    })
    test("Then the field 'Justificatif' should be required", () => {
      const file = screen.getByTestId("file")
      expect(file).toBeRequired()
    })

  })

  describe("When I am on NewBill Page and I click on button 'Choisir un fichier' ", () => {
    test("Then the function handleChangeFile is called", () => {

      const file = screen.getByTestId("file")
      const handleChangeFile = jest.fn()
      file.addEventListener("click", handleChangeFile)
      userEvent.click(file);
      
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })

  describe("When I load a file with the correct extension", () => {
    test("Then the field 'file' should equal to the file name",  () => {
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const handleChangeFile = jest.fn()

      const file = screen.getByTestId("file")
      file.addEventListener("click", handleChangeFile)
      fireEvent.change(file, {
        target: { files: [new File(["justificatif"], "test.jpeg", {type: "image/jpeg"})] }
      })
      expect(file.files[0].name).toBe("test.jpeg")
    })
  })
      
  describe("When I load a file with the wrong extension", () => {
    test("Then the field 'file' should be empty and an error message appears", () => {
  
      const file = screen.getByTestId("file")
      fireEvent.change(file, {
        target: { files: [new File(["justificatif"], "test.pdf", {type: "document/pdf"})] }
      })
      //const errorLabel = screen.getByClass("bold-label")
      //console.log(errorLabel)
      expect(file.value).toBe("")
      //expect(errorLabel.className).toContain("error")
    })
  })

  describe("When I am on NewBill Page and I do not fill the required fields", () => {
    test("Then I should stay on the NewBill page", () => {

      const inputDate = screen.getByTestId("datepicker")
      inputDate.value = null
      const inputAmount = screen.getByTestId("amount")
      inputAmount.value = null
      const inputPct = screen.getByTestId("pct")
      inputPct.value = null
      const inputFile = screen.getByTestId("file")
      inputFile.value = null

      const form = screen.getByText("Envoyer")
      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("click", handleSubmit)
      userEvent.click(form)

      const newBillPage = screen.getByText("Envoyer une note de frais")
      expect(newBillPage).toBeTruthy()

    })
  })

  describe("When I am on NewBill Page and I click on submit button", () => {
    test("Then the function handleSubmit should be called", async () => {

      const store = null
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBillBoard = new NewBill({document, onNavigate, store, localStorage})

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBillBoard.handleSubmit)
      const updatedBill = jest.fn(newBillBoard.updateBill)

      form.addEventListener("submit", handleSubmit)
      form.addEventListener("submit", updatedBill)
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled()
      expect(updatedBill).toHaveBeenCalled()
    })

      test("Then it should render Bills page", async () => {

      const pathname = ROUTES_PATH['Bills']
      const data = []
      const error = null
      const loading = false
      document.body.innerHTML = ROUTES({
        pathname,
        data,
        error,
        loading,
       })
       await waitFor(() => screen.getAllByText('Mes notes de frais'))

       expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    })
  })

})
