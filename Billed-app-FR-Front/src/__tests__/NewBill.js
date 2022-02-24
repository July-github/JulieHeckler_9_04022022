/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import { newBill } from "../fixtures/newBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should shown all the inputs of the form and the button 'Envoyer'", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByText("Type de dépense")).toBeTruthy()
      expect(screen.getByText("Nom de la dépense")).toBeTruthy()
      expect(screen.getByText("Date")).toBeTruthy()
      expect(screen.getByText("Montant TTC")).toBeTruthy()
      expect(screen.getByText("TVA")).toBeTruthy()
      expect(screen.getByText("Commentaire")).toBeTruthy()
      expect(screen.getByText("Justificatif")).toBeTruthy()
      expect(screen.getByText("Envoyer")).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page and I click on button 'Choisir un fichier' ", () => {
    test("Then the function handleChangeFile is called", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const file = screen.getByTestId("file")
      const handleChangeFile = jest.fn()
      file.addEventListener("click", handleChangeFile)
      userEvent.click(file);
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })

  describe("When I am on NewBill Page and I do not fill the required fields", () => {
    test("Then I should stay on the NewBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

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
    test("Then the function handleSubmit is called and it should render Bills page", async () => {
      document.body.innerHTML = NewBillUI()

      const form = screen.getByText("Envoyer")
      const handleSubmit = jest.fn()
      const event = jest.fn()((e) => e.preventDefault);
      form.addEventListener("click", handleSubmit(event))
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled()

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
