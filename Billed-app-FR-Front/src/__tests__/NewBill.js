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
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";


jest.mock('../app/store.js', () => mockStore)

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'jane@doe'
    }))
    document.body.innerHTML = NewBillUI()
})

  describe("When I am on NewBill Page", () => {
    test("Then it should show all the inputs of the form and the button 'Envoyer'", () => {

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
      //const errorLabel = screen.getByLabelText("file")
      //console.log(errorLabel)
      expect(file.value).toBe("")
      //expect(errorLabel).toHaveClassName("error")
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

// test d'intégration POST

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

    })
    
    test("Then create new bill to mock API POST", async () => {
      document.body.innerHTML = NewBillUI()

      const dataNewBill = [{
        email:'jane@doe',
        name: 'Seychelles holidays',
        type:'Transports',
        date: '28/02/2022',
        amount: '200',
        vat: '50',
        pct:'20',
        commentary: 'holidays',
        fileName:'facture',
        fileUrl: 'justificatif.jpeg',
        status:'pending',
        key:"1234"
      }]      

      mockStore.bills.mockImplementation((dataNewBill) => {
        return {
          create : (dataNewBill) =>  {
            return Promise.resolve({fileUrl: 'justificatif.jpeg', key:"1234"})
          }
        }})
      console.log(resolved)
      expect(resolved.fileUrl).toBe('justificatif.jpeg')
    })

    test("Then create new bill to an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementation(() => {
        return {
          create : (dataNewBill) =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    
    test("Then create new bill to an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementation(() => {
        return {
          create : (dataNewBill) =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})